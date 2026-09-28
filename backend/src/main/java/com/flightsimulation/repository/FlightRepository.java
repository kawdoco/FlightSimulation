package com.flightsimulation.repository;

import com.flightsimulation.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlightRepository extends JpaRepository<Flight, Long> {

    boolean existsByFlightNumber(String flightNumber);

    List<Flight> findByStatus(String status);

    List<Flight> findByAircraftId(Long aircraftId);

    boolean existsByAircraftId(Long aircraftId);
}