package com.flightsimulation.repository;

import com.flightsimulation.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    boolean existsByFlightNumber(String flightNumber);

    boolean existsByAircraftId(Long aircraftId);

    List<Flight> findByStatus(String status);

    List<Flight> findByAircraftId(Long aircraftId);

    List<Flight> findByAircraftIdAndStatus(
            Long aircraftId,
            String status
    );

    List<Flight> findByScheduledTimeBetween(
            LocalDateTime start,
            LocalDateTime end
    );

    List<Flight> findByStatusAndScheduledTimeBetween(
            String status,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Flight> findByAircraftIdAndScheduledTimeBetween(
            Long aircraftId,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Flight> findByAircraftIdAndStatusAndScheduledTimeBetween(
            Long aircraftId,
            String status,
            LocalDateTime start,
            LocalDateTime end
    );
}