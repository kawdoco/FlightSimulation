package com.flightsimulation.service;

import com.flightsimulation.entity.Aircraft;
import com.flightsimulation.entity.Flight;
import com.flightsimulation.repository.AircraftRepository;
import com.flightsimulation.repository.FlightRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FlightService {

    private final FlightRepository flightRepository;
    private final AircraftRepository aircraftRepository;

    public FlightService(
            FlightRepository flightRepository,
            AircraftRepository aircraftRepository
    ) {
        this.flightRepository = flightRepository;
        this.aircraftRepository = aircraftRepository;
    }

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    public Flight getFlightById(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Flight not found with id: " + id
                        )
                );
    }

    public Flight createFlight(
            Flight flight,
            Long aircraftId
    ) {

        if (flightRepository.existsByFlightNumber(
                flight.getFlightNumber()
        )) {
            throw new RuntimeException(
                    "Flight number already exists"
            );
        }

        Aircraft aircraft = aircraftRepository
                .findById(aircraftId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Aircraft not found with id: " + aircraftId
                        )
                );

        if (!"AVAILABLE".equalsIgnoreCase(
                aircraft.getStatus()
        )) {
            throw new RuntimeException(
                    "Selected aircraft is not available"
            );
        }

        flight.setAircraft(aircraft);
        flight.setStatus("SCHEDULED");

        return flightRepository.save(flight);
    }

    public Flight updateFlight(
            Long id,
            Flight updatedFlight,
            Long aircraftId
    ) {

        Flight existing = getFlightById(id);

        Aircraft aircraft = aircraftRepository
                .findById(aircraftId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Aircraft not found with id: " + aircraftId
                        )
                );

        existing.setFlightNumber(
                updatedFlight.getFlightNumber()
        );

        existing.setDeparture(
                updatedFlight.getDeparture()
        );

        existing.setDestination(
                updatedFlight.getDestination()
        );

        existing.setScheduledTime(
                updatedFlight.getScheduledTime()
        );

        existing.setAircraft(aircraft);

        return flightRepository.save(existing);
    }

    public Flight startFlight(Long id) {

        Flight flight = getFlightById(id);

        if ("IN_PROGRESS".equalsIgnoreCase(
                flight.getStatus()
        )) {
            throw new RuntimeException(
                    "Flight is already in progress"
            );
        }

        if ("COMPLETED".equalsIgnoreCase(
                flight.getStatus()
        )) {
            throw new RuntimeException(
                    "Completed flight cannot be started again"
            );
        }

        if ("CANCELLED".equalsIgnoreCase(
                flight.getStatus()
        )) {
            throw new RuntimeException(
                    "Cancelled flight cannot be started"
            );
        }

        Aircraft aircraft = flight.getAircraft();

        aircraft.setStatus("IN_FLIGHT");
        aircraftRepository.save(aircraft);

        flight.setStatus("IN_PROGRESS");
        flight.setStartTime(LocalDateTime.now());

        return flightRepository.save(flight);
    }

    public Flight completeFlight(Long id) {

        Flight flight = getFlightById(id);

        if (!"IN_PROGRESS".equalsIgnoreCase(
                flight.getStatus()
        )) {
            throw new RuntimeException(
                    "Only an active flight can be completed"
            );
        }

        Aircraft aircraft = flight.getAircraft();

        aircraft.setStatus("AVAILABLE");
        aircraftRepository.save(aircraft);

        flight.setStatus("COMPLETED");
        flight.setEndTime(LocalDateTime.now());

        return flightRepository.save(flight);
    }

    public Flight cancelFlight(Long id) {

        Flight flight = getFlightById(id);

        if ("IN_PROGRESS".equalsIgnoreCase(
                flight.getStatus()
        )) {
            throw new RuntimeException(
                    "Cannot cancel an active flight"
            );
        }

        if ("COMPLETED".equalsIgnoreCase(
                flight.getStatus()
        )) {
            throw new RuntimeException(
                    "Cannot cancel a completed flight"
            );
        }

        flight.setStatus("CANCELLED");

        return flightRepository.save(flight);
    }

    public void deleteFlight(Long id) {

        Flight flight = getFlightById(id);

        if ("IN_PROGRESS".equalsIgnoreCase(
                flight.getStatus()
        )) {
            throw new RuntimeException(
                    "Cannot delete an active flight"
            );
        }

        flightRepository.delete(flight);
    }

    // ==========================================
    // Sprint 2 - Flight History
    // ==========================================

    public List<Flight> getFlightHistory(
            Long aircraftId,
            String status,
            LocalDateTime start,
            LocalDateTime end
    ) {

        // Aircraft + Status + Date Range
        if (
                aircraftId != null &&
                status != null &&
                !status.isBlank() &&
                start != null &&
                end != null
        ) {

            return flightRepository
                    .findByAircraftIdAndStatusAndScheduledTimeBetween(
                            aircraftId,
                            status,
                            start,
                            end
                    );
        }

        // Aircraft + Status
        if (
                aircraftId != null &&
                status != null &&
                !status.isBlank()
        ) {

            return flightRepository
                    .findByAircraftIdAndStatus(
                            aircraftId,
                            status
                    );
        }

        // Aircraft + Date Range
        if (
                aircraftId != null &&
                start != null &&
                end != null
        ) {

            return flightRepository
                    .findByAircraftIdAndScheduledTimeBetween(
                            aircraftId,
                            start,
                            end
                    );
        }

        // Status + Date Range
        if (
                status != null &&
                !status.isBlank() &&
                start != null &&
                end != null
        ) {

            return flightRepository
                    .findByStatusAndScheduledTimeBetween(
                            status,
                            start,
                            end
                    );
        }

        // Aircraft only
        if (aircraftId != null) {

            return flightRepository
                    .findByAircraftId(
                            aircraftId
                    );
        }

        // Status only
        if (
                status != null &&
                !status.isBlank()
        ) {

            return flightRepository
                    .findByStatus(
                            status
                    );
        }

        // Date range only
        if (
                start != null &&
                end != null
        ) {

            return flightRepository
                    .findByScheduledTimeBetween(
                            start,
                            end
                    );
        }

        // No filters
        return flightRepository.findAll();
    }
}