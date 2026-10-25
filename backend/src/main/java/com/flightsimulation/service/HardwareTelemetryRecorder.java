package com.flightsimulation.service;

import com.flightsimulation.entity.Telemetry;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;
import java.nio.file.*;
import java.nio.channels.FileChannel;
import java.nio.ByteBuffer;
import java.util.*;
import java.util.concurrent.*;

/** Disk spool survives database outages and restarts; retries use a stable ingestion key. */
@Service
public class HardwareTelemetryRecorder {
    private final TelemetryService storage;
    private final ObjectMapper mapper;
    private final Path directory;
    private final int maxPending;
    private final boolean enabled;
    private final ScheduledExecutorService worker = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread t = new Thread(r, "hardware-recording"); t.setDaemon(true); return t;
    });
    private volatile String error;
    private volatile String intakeError;
    private long sequence;
    private final java.util.concurrent.atomic.AtomicLong pendingCount = new java.util.concurrent.atomic.AtomicLong();
    public record Sample(long flightId, String key, String recordedAt, Double altitude, Double speed,
                         Double pitch, Double roll, Double heading, Double throttle, Double fuel,
                         Boolean altitudeValid, Boolean imuValid, Boolean commandFresh) {}

    public HardwareTelemetryRecorder(TelemetryService storage, ObjectMapper mapper,
            @Value("${flightsimulation.recording.directory:./data/hardware-spool}") String directory,
            @Value("${flightsimulation.recording.max-pending:100000}") int maxPending,
            @Value("${flightsimulation.serial.enabled:false}") boolean enabled) {
        this.storage = storage; this.mapper = mapper;
        this.directory = Path.of(directory); this.maxPending = maxPending;
        this.enabled = enabled;
        if (Files.isDirectory(this.directory)) {
            try (var files = Files.list(this.directory)) {
                pendingCount.set(files.filter(p -> p.toString().endsWith(".json")).count());
            } catch (java.io.IOException ex) { throw new IllegalStateException("Cannot inspect recording spool", ex); }
        }
    }
    @PostConstruct public void start() {
        if (!enabled) return; // Only the serial owner may replay this spool.
        worker.scheduleWithFixedDelay(this::drain, 0, 100, TimeUnit.MILLISECONDS);
    }
    public synchronized void record(Long flightId, Telemetry input) {
        try {
            Files.createDirectories(directory);
            if (pending() >= maxPending) throw new java.io.IOException("Recording spool full; restore database or increase capacity");
            String key = UUID.randomUUID().toString();
            var sample = new Sample(flightId, key,
                    (input.getRecordedAt() == null ? java.time.LocalDateTime.now() : input.getRecordedAt()).toString(),
                    input.getAltitude(), input.getSpeed(), input.getPitch(), input.getRoll(), input.getHeading(), input.getThrottle(), input.getFuel(),
                    input.getAltitudeValid(), input.getImuValid(), input.getCommandFresh());
            String name = String.format("%019d-%019d-%s", System.currentTimeMillis(), sequence++, key);
            Path temporary = directory.resolve(name + ".tmp");
            byte[] bytes = mapper.writeValueAsBytes(sample);
            try (var channel = FileChannel.open(temporary, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE)) {
                var buffer = ByteBuffer.wrap(bytes);
                while (buffer.hasRemaining()) channel.write(buffer);
                channel.force(true);
            }
            Files.move(temporary, directory.resolve(name + ".json"), StandardCopyOption.ATOMIC_MOVE);
            pendingCount.incrementAndGet();
            intakeError = null;
        } catch (Exception ex) {
            intakeError = "Unable to queue telemetry: " + ex.getMessage();
            org.slf4j.LoggerFactory.getLogger(getClass()).error(intakeError);
        }
    }
    private long pending() { return pendingCount.get(); }
    private void drain() {
        try {
            if (!Files.isDirectory(directory)) return;
            List<Path> batch;
            try (var files = Files.list(directory)) {
                batch = files.filter(p -> p.toString().endsWith(".json")).sorted().limit(100).toList();
            }
            for (Path path : batch) {
                if (Thread.currentThread().isInterrupted()) return;
                Sample s = mapper.readValue(Files.readAllBytes(path), Sample.class);
                Telemetry t = new Telemetry();
                t.setIngestKey(s.key()); t.setRecordedAt(java.time.LocalDateTime.parse(s.recordedAt()));
                t.setAltitude(s.altitude()); t.setSpeed(s.speed()); t.setPitch(s.pitch()); t.setRoll(s.roll());
                t.setHeading(s.heading()); t.setThrottle(s.throttle()); t.setFuel(s.fuel());
                t.setAltitudeValid(s.altitudeValid()); t.setImuValid(s.imuValid()); t.setCommandFresh(s.commandFresh());
                storage.saveTelemetry(s.flightId(), t);
                synchronized (this) {
                    Files.delete(path);
                    pendingCount.decrementAndGet();
                }
            }
            error = null;
        } catch (Exception ex) {
            error = "Recording delayed: " + ex.getClass().getSimpleName();
        }
    }
    public Map<String, Object> status() {
        var result = new LinkedHashMap<String, Object>();
        result.put("pending", pending());
        result.put("error", intakeError != null ? intakeError : error);
        result.put("mode", "durable-retry");
        return result;
    }
    @PreDestroy public void stop() {
        worker.shutdownNow();
        try { worker.awaitTermination(5, TimeUnit.SECONDS); }
        catch (InterruptedException ex) { Thread.currentThread().interrupt(); }
    }
}
