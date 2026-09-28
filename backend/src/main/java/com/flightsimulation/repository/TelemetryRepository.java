package com.flightsimulation.repository;

import com.flightsimulation.entity.Telemetry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TelemetryRepository
        extends JpaRepository<Telemetry, Long> {

    List<Telemetry> findByFlightIdOrderByRecordedAtDesc(Long flightId);
}