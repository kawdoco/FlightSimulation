package com.flightsimulation.controller;

import com.flightsimulation.entity.Alert;
import com.flightsimulation.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:5173")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> getAlertById(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.getAlertById(id));
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(
            @Valid @RequestBody Alert alert
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(alertService.createAlert(alert));
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                alertService.acknowledgeAlert(id)
        );
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<Alert> resolveAlert(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                alertService.resolveAlert(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlert(
            @PathVariable Long id
    ) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}