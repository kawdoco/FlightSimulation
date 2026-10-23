package com.flightsimulation.controller;

import com.flightsimulation.entity.Telemetry;
import com.flightsimulation.service.TelemetryService;
import com.flightsimulation.service.TelemetryIngestionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin(origins = "http://localhost:5173")
public class TelemetryController {

    private final TelemetryService telemetryService;
    private final TelemetryIngestionService telemetryIngestionService;

    public TelemetryController(
            TelemetryService telemetryService,
            TelemetryIngestionService telemetryIngestionService
    ) {
        this.telemetryService = telemetryService;
        this.telemetryIngestionService = telemetryIngestionService;
    }

    // ==========================================
    // Save Telemetry
    // ==========================================

    @PostMapping("/{flightId}")
    public ResponseEntity<Telemetry> saveTelemetry(
            @PathVariable Long flightId,
            @Valid @RequestBody Telemetry telemetry
    ) {

        Telemetry saved = telemetryIngestionService.saveAndBroadcast(flightId, telemetry);

        return ResponseEntity.ok(saved);
    }

    // ==========================================
    // Get Telemetry By Flight
    // ==========================================

    @GetMapping("/{flightId}")
    public ResponseEntity<List<Telemetry>>
    getTelemetry(
            @PathVariable Long flightId
    ) {

        return ResponseEntity.ok(
                telemetryService
                        .getTelemetryByFlight(
                                flightId
                        )
        );
    }

    // ==========================================
    // Sprint 2 - Telemetry Summary
    // ==========================================

    @GetMapping("/{flightId}/summary")
    public ResponseEntity<Map<String, Object>>
    getTelemetrySummary(
            @PathVariable Long flightId
    ) {

        return ResponseEntity.ok(
                telemetryService
                        .getTelemetrySummary(
                                flightId
                        )
        );
    }

    // ==========================================
    // Sprint 2 - CSV Export
    // ==========================================

    @GetMapping(
            value = "/{flightId}/export",
            produces = "text/csv"
    )
    public ResponseEntity<String>
    exportTelemetry(
            @PathVariable Long flightId
    ) {

        String csv =
                telemetryService
                        .exportTelemetryToCsv(
                                flightId
                        );

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=flight-"
                                + flightId
                                + "-telemetry.csv"
                )
                .contentType(
                        MediaType.parseMediaType(
                                "text/csv"
                        )
                )
                .body(csv);
    }
}