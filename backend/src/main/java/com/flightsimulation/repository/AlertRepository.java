package com.flightsimulation.repository;

import com.flightsimulation.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByAircraftId(Long aircraftId);

    List<Alert> findByStatus(String status);

    List<Alert> findBySeverity(String severity);
}