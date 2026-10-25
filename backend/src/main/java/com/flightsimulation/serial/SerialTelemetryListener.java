package com.flightsimulation.serial;

import com.fazecast.jSerialComm.SerialPort;
import com.flightsimulation.entity.Telemetry;
import com.flightsimulation.exception.ResourceNotFoundException;
import com.flightsimulation.service.TelemetryIngestionService;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.dao.DataAccessException;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@ConditionalOnProperty(
        prefix = "flightsimulation.serial",
        name = "enabled",
        havingValue = "true"
)
public class SerialTelemetryListener {

    private static final Logger logger =
            LoggerFactory.getLogger(SerialTelemetryListener.class);

    private final ObjectMapper objectMapper;
    private final Validator validator;
    private final TelemetryIngestionService telemetryIngestionService;
    private final String portName;
    private final int baudRate;
    private final com.flightsimulation.service.HardwareSession session;

    private volatile boolean running;
    private volatile SerialPort serialPort;
    private Thread readerThread;

    public SerialTelemetryListener(
            ObjectMapper objectMapper,
            Validator validator,
            TelemetryIngestionService telemetryIngestionService,
            @Value("${flightsimulation.serial.port}") String portName,
            @Value("${flightsimulation.serial.baud-rate}") int baudRate,
            com.flightsimulation.service.HardwareSession session
    ) {
        this.objectMapper = objectMapper;
        this.validator = validator;
        this.telemetryIngestionService = telemetryIngestionService;
        this.portName = portName;
        this.baudRate = baudRate;
        this.session = session;
    }

    @PostConstruct
    public void start() {
        running = true;
        readerThread = new Thread(this::connectionLoop, "esp32-serial-telemetry");
        readerThread.setDaemon(true);
        readerThread.start();
    }

    private void connectionLoop() {
        while(running && !Thread.currentThread().isInterrupted()) {
            try {
                serialPort = resolvePort();
                serialPort.setBaudRate(baudRate);
                serialPort.setNumDataBits(8);
                serialPort.setNumStopBits(SerialPort.ONE_STOP_BIT);
                serialPort.setParity(SerialPort.NO_PARITY);
                serialPort.clearDTR();
                serialPort.clearRTS();
                serialPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 0, 0);
                if(!serialPort.isOpen() && !serialPort.openPort()) throw new IOException("Serial port unavailable");
                if(!running) break;
                session.connected(serialPort.getSystemPortName());
                logger.info("ESP32 connected on {} at {} baud",serialPort.getSystemPortName(),baudRate);
                readTelemetry();
            } catch(IOException | RuntimeException ex) {
                if(running) logger.warn("ESP32 connection unavailable on {}; retrying in 3 seconds",portName);
            } finally {
                session.disconnected();
                if(serialPort!=null && serialPort.isOpen()) serialPort.closePort();
            }
            if(running) try { Thread.sleep(3000); }
            catch(InterruptedException ex){Thread.currentThread().interrupt();break;}
        }
    }
    private SerialPort resolvePort() throws IOException {
        if (!"AUTO".equalsIgnoreCase(portName)) return SerialPort.getCommPort(portName);
        for (SerialPort candidate : SerialPort.getCommPorts()) {
            if (!running) break;
            candidate.setBaudRate(baudRate);
            candidate.clearDTR();
            candidate.clearRTS();
            candidate.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 300, 0);
            if (!candidate.openPort()) continue;
            boolean recognized = false;
            try {
                var frames = new SerialLineReader(new BufferedReader(new InputStreamReader(candidate.getInputStream(), StandardCharsets.UTF_8)), 4096);
                long deadline = System.nanoTime() + 5_000_000_000L;
                while (running && System.nanoTime() < deadline) {
                    try {
                        String line = frames.readLine();
                        if (line == null) break;
                        if (!line.stripLeading().startsWith("{")) continue;
                        var packet = objectMapper.readValue(line, SerialTelemetryPacket.class);
                        if (validator.validate(packet).isEmpty()) { recognized = true; return candidate; }
                    } catch (RuntimeException | IOException ignored) { /* Try another frame until deadline. */ }
                }
            } finally { if (!recognized) candidate.closePort(); }
        }
        throw new IOException("No controller JSON telemetry found; connect USB and close Serial Monitor");
    }
    private void readTelemetry() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(serialPort.getInputStream(), StandardCharsets.UTF_8)
        )) {
            SerialLineReader frames = new SerialLineReader(reader, 4096);
            while (running) {
                String line;
                try { line = frames.readLine(); }
                catch(SerialLineReader.FrameTooLongException ex){logger.warn("Discarded oversized ESP32 serial frame");continue;}
                if(line == null) throw new IOException("Serial connection ended");                if (line.isBlank()) {
                    continue;
                }
                if (!line.stripLeading().startsWith("{")) {
                    logger.debug("ESP32 status: {}", line);
                    continue;
                }

                try {
                    ingestLine(line);
                } catch (JacksonException | IllegalArgumentException exception) {
                    logger.warn("Ignoring invalid ESP32 serial telemetry: {}", exception.getMessage());
                } catch (ResourceNotFoundException | DataAccessException | MessagingException exception) {
                    logger.error("Could not persist or broadcast ESP32 serial telemetry", exception);
                }
            }
        } catch (IOException exception) {
            if (running) {
                logger.error("ESP32 serial telemetry reader stopped unexpectedly", exception);
            }
        }
    }

    private void ingestLine(String line) {
        SerialTelemetryPacket packet =
                objectMapper.readValue(line, SerialTelemetryPacket.class);
        Set<ConstraintViolation<SerialTelemetryPacket>> violations = validator.validate(packet);
        if (!violations.isEmpty()) {
            String reasons = violations.stream()
                    .map(ConstraintViolation::getMessage)
                    .collect(Collectors.joining(", "));
            throw new IllegalArgumentException("Invalid telemetry values: " + reasons);
        }

        Telemetry telemetry = new Telemetry();
        // ESP32 ultrasonic distance is in centimeters; simulator altitude is in feet.
        telemetry.setAltitude(packet.altitude() / 30.48);
        telemetry.setSpeed(packet.speed());
        telemetry.setPitch(packet.pitch());
        telemetry.setRoll(packet.roll());
        telemetry.setHeading(packet.heading());
        telemetry.setThrottle(packet.throttle());
        telemetry.setFuel(packet.fuel());
        telemetry.setAltitudeValid(packet.altitudeValid());
        telemetry.setImuValid(packet.imuValid());
        telemetry.setCommandFresh(packet.commandFresh());
        session.received();
        telemetryIngestionService.ingestLiveTelemetry(session.flightId(), telemetry);
    }

    @PreDestroy
    public void stop() {
        running = false;
        if (serialPort != null && serialPort.isOpen()) {
            serialPort.closePort();
        }
        if (readerThread != null) {
            readerThread.interrupt();
        }
    }
}


