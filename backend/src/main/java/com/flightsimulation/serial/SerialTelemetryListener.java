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
    private final long flightId;

    private volatile boolean running;
    private SerialPort serialPort;
    private Thread readerThread;

    public SerialTelemetryListener(
            ObjectMapper objectMapper,
            Validator validator,
            TelemetryIngestionService telemetryIngestionService,
            @Value("${flightsimulation.serial.port}") String portName,
            @Value("${flightsimulation.serial.baud-rate}") int baudRate,
            @Value("${flightsimulation.serial.flight-id}") long flightId
    ) {
        this.objectMapper = objectMapper;
        this.validator = validator;
        this.telemetryIngestionService = telemetryIngestionService;
        this.portName = portName;
        this.baudRate = baudRate;
        this.flightId = flightId;
    }

    @PostConstruct
    public void start() {
        serialPort = SerialPort.getCommPort(portName);
        serialPort.setBaudRate(baudRate);
        serialPort.setNumDataBits(8);
        serialPort.setNumStopBits(SerialPort.ONE_STOP_BIT);
        serialPort.setParity(SerialPort.NO_PARITY);
        // Wait for data without terminating the reader while the plane connects.
        serialPort.setComPortTimeouts(SerialPort.TIMEOUT_READ_SEMI_BLOCKING, 0, 0);

        if (!serialPort.openPort()) {
            throw new IllegalStateException(
                    "Could not open ESP32 serial port " + portName
                            + ". Check the COM port and close any serial monitor using it."
            );
        }

        running = true;
        readerThread = new Thread(this::readTelemetry, "esp32-serial-telemetry");
        readerThread.setDaemon(true);
        readerThread.start();
        logger.info("ESP32 serial telemetry enabled on {} at {} baud", portName, baudRate);
    }

    private void readTelemetry() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(serialPort.getInputStream(), StandardCharsets.UTF_8)
        )) {
            while (running) {
                String line = reader.readLine();
                if (line == null) {
                    try {
                        Thread.sleep(25);
                    } catch (InterruptedException exception) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    continue;
                }
                if (line.isBlank()) {
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
        telemetryIngestionService.ingestLiveTelemetry(flightId, telemetry);
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
