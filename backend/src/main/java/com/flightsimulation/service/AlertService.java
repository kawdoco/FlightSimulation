package com.flightsimulation.service;

import com.flightsimulation.entity.Alert;
import com.flightsimulation.exception.ResourceNotFoundException;
import com.flightsimulation.repository.AircraftRepository;
import com.flightsimulation.repository.AlertRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final AircraftRepository aircraftRepository;

    private static final Set<String> VALID_SEVERITIES =
            Set.of("INFO", "WARNING", "CRITICAL");

    private static final Set<String> VALID_STATUSES =
            Set.of("OPEN", "ACKNOWLEDGED", "RESOLVED");

    public AlertService(
            AlertRepository alertRepository,
            AircraftRepository aircraftRepository
    ) {
        this.alertRepository = alertRepository;
        this.aircraftRepository = aircraftRepository;
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAll();
    }

    public Alert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Alert not found with id: " + id
                        )
                );
    }

    public List<Alert> getAlertsByAircraft(Long aircraftId) {

        if (!aircraftRepository.existsById(aircraftId)) {
            throw new ResourceNotFoundException(
                    "Aircraft not found with id: " + aircraftId
            );
        }

        return alertRepository.findByAircraftId(aircraftId);
    }

    public Alert createAlert(Alert alert) {

        validateAlert(alert);

        alert.setStatus("OPEN");
        alert.setCreatedAt(LocalDateTime.now());
        alert.setResolvedAt(null);

        return alertRepository.save(alert);
    }

    public Alert updateAlert(Long id, Alert updatedAlert) {

        Alert existing = getAlertById(id);

        validateAlert(updatedAlert);

        existing.setAircraftId(updatedAlert.getAircraftId());
        existing.setFlightId(updatedAlert.getFlightId());
        existing.setType(updatedAlert.getType());
        existing.setMessage(updatedAlert.getMessage());
        existing.setSeverity(updatedAlert.getSeverity());

        return alertRepository.save(existing);
    }

    public Alert acknowledgeAlert(Long id) {

        Alert alert = getAlertById(id);

        if (!"OPEN".equals(alert.getStatus())) {
            throw new IllegalArgumentException(
                    "Only OPEN alerts can be acknowledged"
            );
        }

        alert.setStatus("ACKNOWLEDGED");

        return alertRepository.save(alert);
    }

    public Alert resolveAlert(Long id) {

        Alert alert = getAlertById(id);

        if ("RESOLVED".equals(alert.getStatus())) {
            throw new IllegalArgumentException(
                    "Alert is already resolved"
            );
        }

        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());

        return alertRepository.save(alert);
    }

    public void deleteAlert(Long id) {

        Alert alert = getAlertById(id);

        alertRepository.delete(alert);
    }

    private void validateAlert(Alert alert) {

        if (!aircraftRepository.existsById(alert.getAircraftId())) {
            throw new ResourceNotFoundException(
                    "Aircraft not found with id: "
                            + alert.getAircraftId()
            );
        }

        if (!VALID_SEVERITIES.contains(alert.getSeverity())) {
            throw new IllegalArgumentException(
                    "Invalid severity. Allowed values: " +
                    "INFO, WARNING, CRITICAL"
            );
        }
    }
}