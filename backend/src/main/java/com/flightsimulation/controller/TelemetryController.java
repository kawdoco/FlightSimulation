package com.flightsimulation.controller;

import com.flightsimulation.entity.Telemetry;
import com.flightsimulation.service.TelemetryService;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@CrossOrigin(origins = "http://localhost:5173")
public class TelemetryController {

    private final TelemetryService telemetryService;
        private final SimpMessagingTemplate messagingTemplate;

    public TelemetryController(
                        TelemetryService telemetryService,
                        SimpMessagingTemplate messagingTemplate
    ) {
        this.telemetryService = telemetryService;
                this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/{flightId}")
    public ResponseEntity<Telemetry> saveTelemetry(
            @PathVariable Long flightId,
            @RequestBody Telemetry telemetry
    ) {
        Telemetry saved = telemetryService.saveTelemetry(flightId, telemetry);

        messagingTemplate.convertAndSend(
                "/topic/telemetry/" + flightId,
                saved
        );

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{flightId}")
    public ResponseEntity<List<Telemetry>>
    getTelemetry(
            @PathVariable Long flightId
    ) {
        return ResponseEntity.ok(
                telemetryService.getTelemetryByFlight(
                        flightId
                )
        );
    }
}