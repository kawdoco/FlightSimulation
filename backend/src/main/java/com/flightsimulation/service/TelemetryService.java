package com.flightsimulation.service;

import com.flightsimulation.entity.Flight;
import com.flightsimulation.entity.Telemetry;
import com.flightsimulation.exception.ResourceNotFoundException;
import com.flightsimulation.repository.FlightRepository;
import com.flightsimulation.repository.TelemetryRepository;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TelemetryService {

    private final TelemetryRepository telemetryRepository;
    private final FlightRepository flightRepository;

    public TelemetryService(
            TelemetryRepository telemetryRepository,
            FlightRepository flightRepository
    ) {
        this.telemetryRepository = telemetryRepository;
        this.flightRepository = flightRepository;
    }

    public Telemetry saveTelemetry(
            Long flightId,
            Telemetry telemetry
    ) {
        if (telemetry.getIngestKey() != null) {
            var existing = telemetryRepository.findByIngestKey(telemetry.getIngestKey());
            if (existing.isPresent()) return existing.get();
        }
        Flight flight = flightRepository
                .findById(flightId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Flight not found with id: " + flightId
                        )
                );

        telemetry.setFlight(flight);

        return telemetryRepository.save(telemetry);
    }

    public record HistoryPage(List<Telemetry> content, int page, int size, boolean hasNext) {}
    public HistoryPage getHistory(Long flightId, int page, int size) {
        if(page < 0 || size < 1 || size > 200) throw new IllegalArgumentException("Page must be nonnegative and size must be between 1 and 200");
        if(!flightRepository.existsById(flightId)) throw new ResourceNotFoundException("Flight not found with id: " + flightId);
        var records = telemetryRepository.findByFlightId(flightId,
            org.springframework.data.domain.PageRequest.of(page,size,
                org.springframework.data.domain.Sort.by("recordedAt").descending().and(org.springframework.data.domain.Sort.by("id").descending())));
        return new HistoryPage(records.getContent(),page,size,records.hasNext());
    }
    public List<Telemetry> getTelemetryByFlight(
            Long flightId
    ) {

        return getHistory(flightId,0,200).content();
    }
    // ==========================================
    // Sprint 2 - Telemetry Summary Report
    // ==========================================

    public Map<String, Object> getTelemetrySummary(
            Long flightId
    ) {

        Flight flight = flightRepository
                .findById(flightId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Flight not found with id: " + flightId
                        )
                );

        var aggregate = telemetryRepository.summarize(flightId);
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("flightId", flight.getId());
        summary.put("flightNumber", flight.getFlightNumber());
        summary.put("status", flight.getStatus());
        summary.put("recordCount", aggregate.getRecordCount());
        summary.put("averageAltitude", aggregate.getAverageAltitude());
        summary.put("maxAltitude", aggregate.getMaxAltitude());
        summary.put("averageSpeed", aggregate.getAverageSpeed());
        summary.put("maxSpeed", aggregate.getMaxSpeed());
        summary.put("minimumFuel", aggregate.getMinimumFuel());
        return summary;
    }
    // ==========================================
    // Sprint 2 - CSV Export
    // ==========================================

    public org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody exportTelemetryToCsv(Long flightId) {
        Flight flight = flightRepository.findById(flightId)
            .orElseThrow(() -> new ResourceNotFoundException("Flight not found with id: " + flightId));
        String flightNumber = flight.getFlightNumber();
        String status = flight.getStatus();
        long upperId = telemetryRepository.exportUpperId(flightId);
        return output -> {
            var writer = new java.io.BufferedWriter(new java.io.OutputStreamWriter(output, java.nio.charset.StandardCharsets.UTF_8));
            writer.write("Flight ID," + flightId + "\r\nFlight Number," + csvText(flightNumber)
                + "\r\nStatus," + csvText(status) + "\r\n\r\n");
            writer.write("recordedAt,altitude,speed,pitch,roll,heading,throttle,fuel,altitudeValid,imuValid,commandFresh\r\n");
            long cursor = upperId;
            while(cursor > 0) {
                var batch = telemetryRepository.findByFlightIdAndIdLessThanEqualOrderByIdDesc(
                    flightId,cursor,org.springframework.data.domain.PageRequest.of(0,500));
                if(batch.isEmpty()) break;
                for(var t : batch) {
                    writer.write(value(t.getRecordedAt()) + "," + value(t.getAltitude()) + "," + value(t.getSpeed())
                        + "," + value(t.getPitch()) + "," + value(t.getRoll()) + "," + value(t.getHeading())
                        + "," + value(t.getThrottle()) + "," + value(t.getFuel())
                        + "," + value(t.getAltitudeValid()) + "," + value(t.getImuValid()) + "," + value(t.getCommandFresh()) + "\r\n");
                }
                cursor = batch.getLast().getId() - 1;
                writer.flush();
            }
            writer.flush();
        };
    }
    private static String value(Object value) { return value == null ? "" : value.toString(); }
    static String csvText(String text) {
        if(text == null) return "\"\"";
        String stripped = text.stripLeading();
        if(!stripped.isEmpty() && "=+-@".indexOf(stripped.charAt(0)) >= 0
            || text.startsWith("\t") || text.startsWith("\r") || text.startsWith("\n")) text = "'" + text;
        return "\"" + text.replace("\"", "\"\"") + "\"";
    }
}

