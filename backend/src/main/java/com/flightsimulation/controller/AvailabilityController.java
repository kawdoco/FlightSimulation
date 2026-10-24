package com.flightsimulation.controller;

import java.net.InetAddress;
import javax.sql.DataSource;
import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

/** Loopback-only probe, with no account, schema or diagnostic information. */
@RestController
public class AvailabilityController {
    private final DataSource database;
    private final ApplicationAvailability availability;
    public AvailabilityController(DataSource database, ApplicationAvailability availability) {
        this.database = database; this.availability = availability;
    }
    @GetMapping("/internal/available")
    public ResponseEntity<Void> available(HttpServletRequest request) {
        try {
            if (!InetAddress.getByName(request.getRemoteAddr()).isLoopbackAddress())
                return ResponseEntity.status(403).build();
            if (availability.getReadinessState() != ReadinessState.ACCEPTING_TRAFFIC)
                return ResponseEntity.status(503).build();
            try (var connection = database.getConnection(); var query = connection.createStatement()) {
                query.setQueryTimeout(2); query.execute("SELECT 1");
            }
            return ResponseEntity.noContent().build();
        } catch (Exception ignored) { return ResponseEntity.status(503).build(); }
    }
}
