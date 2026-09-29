package com.flightsimulation.service;

import com.flightsimulation.entity.Aircraft;
import com.flightsimulation.entity.Flight;
import com.flightsimulation.exception.DuplicateResourceException;
import com.flightsimulation.exception.ResourceNotFoundException;
import com.flightsimulation.repository.AircraftRepository;
import com.flightsimulation.repository.FlightRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                        new ResourceNotFoundException(
                                "Flight not found with id: " + id
                        )
                );
    }

<<<<<<< HEAD
=======
    private Aircraft getAircraftById(Long aircraftId) {
        return aircraftRepository.findById(aircraftId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Aircraft not found with id: " + aircraftId
                        )
                );
    }

    private void validateAircraftAvailability(Aircraft aircraft) {

        if (!"AVAILABLE".equalsIgnoreCase(aircraft.getStatus())) {

            throw new IllegalStateException(
                    "Aircraft "
                            + aircraft.getRegistrationNumber()
                            + " is unavailable. Current status: "
                            + aircraft.getStatus()
            );
        }
    }

    @Transactional
>>>>>>> origin/develop
    public Flight createFlight(
            Flight flight,
            Long aircraftId
    ) {

        if (flightRepository.existsByFlightNumber(
                flight.getFlightNumber()
        )) {

            throw new DuplicateResourceException(
                    "Flight number already exists"
            );
        }

        Aircraft aircraft = getAircraftById(aircraftId);

        // Only AVAILABLE aircraft can be assigned
        validateAircraftAvailability(aircraft);

        flight.setAircraft(aircraft);
        flight.setStatus("SCHEDULED");

        return flightRepository.save(flight);
    }

    @Transactional
    public Flight updateFlight(
            Long id,
            Flight updatedFlight,
            Long aircraftId
    ) {

        Flight existing = getFlightById(id);

<<<<<<< HEAD
        Aircraft aircraft = aircraftRepository
                .findById(aircraftId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Aircraft not found with id: " + aircraftId
                        )
                );
=======
        // Active flights must not be edited
        if ("IN_PROGRESS".equalsIgnoreCase(
                existing.getStatus()
        )) {

            throw new IllegalStateException(
                    "Cannot update a flight that is currently in progress"
            );
        }

        if ("COMPLETED".equalsIgnoreCase(
                existing.getStatus()
        )) {

            throw new IllegalStateException(
                    "Cannot update a completed flight"
            );
        }

        if ("CANCELLED".equalsIgnoreCase(
                existing.getStatus()
        )) {

            throw new IllegalStateException(
                    "Cannot update a cancelled flight"
            );
        }

        Aircraft aircraft = getAircraftById(aircraftId);

        // Prevent assigning unavailable aircraft
        validateAircraftAvailability(aircraft);
>>>>>>> origin/develop

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

    @Transactional
    public Flight startFlight(Long id) {

        Flight flight = getFlightById(id);

        if ("IN_PROGRESS".equalsIgnoreCase(
                flight.getStatus()
        )) {
<<<<<<< HEAD
            throw new RuntimeException(
=======

            throw new IllegalStateException(
>>>>>>> origin/develop
                    "Flight is already in progress"
            );
        }

        if ("COMPLETED".equalsIgnoreCase(
                flight.getStatus()
        )) {
<<<<<<< HEAD
            throw new RuntimeException(
=======

            throw new IllegalStateException(
>>>>>>> origin/develop
                    "Completed flight cannot be started again"
            );
        }

        if ("CANCELLED".equalsIgnoreCase(
                flight.getStatus()
        )) {
<<<<<<< HEAD
            throw new RuntimeException(
=======

            throw new IllegalStateException(
>>>>>>> origin/develop
                    "Cancelled flight cannot be started"
            );
        }

        Aircraft aircraft = flight.getAircraft();

        // Check availability again before starting
        validateAircraftAvailability(aircraft);

        // Aircraft is now being used by the flight
        aircraft.setStatus("IN_FLIGHT");

        aircraftRepository.save(aircraft);

        flight.setStatus("IN_PROGRESS");
        flight.setStartTime(LocalDateTime.now());

        return flightRepository.save(flight);
    }

    @Transactional
    public Flight completeFlight(Long id) {

        Flight flight = getFlightById(id);

        if (!"IN_PROGRESS".equalsIgnoreCase(
                flight.getStatus()
        )) {
<<<<<<< HEAD
            throw new RuntimeException(
                    "Only an active flight can be completed"
=======

            throw new IllegalStateException(
                    "Only an in-progress flight can be completed"
>>>>>>> origin/develop
            );
        }

        Aircraft aircraft = flight.getAircraft();

        // Maintenance integration will later decide whether
        // this should remain AVAILABLE or move to MAINTENANCE.
        aircraft.setStatus("AVAILABLE");

        aircraftRepository.save(aircraft);

        flight.setStatus("COMPLETED");
        flight.setEndTime(LocalDateTime.now());

        return flightRepository.save(flight);
    }

    @Transactional
    public Flight cancelFlight(Long id) {

        Flight flight = getFlightById(id);

        if ("IN_PROGRESS".equalsIgnoreCase(
                flight.getStatus()
        )) {
<<<<<<< HEAD
            throw new RuntimeException(
=======

            throw new IllegalStateException(
>>>>>>> origin/develop
                    "Cannot cancel an active flight"
            );
        }

        if ("COMPLETED".equalsIgnoreCase(
                flight.getStatus()
        )) {
<<<<<<< HEAD
            throw new RuntimeException(
=======

            throw new IllegalStateException(
>>>>>>> origin/develop
                    "Cannot cancel a completed flight"
            );
        }

<<<<<<< HEAD
=======
        if ("CANCELLED".equalsIgnoreCase(
                flight.getStatus()
        )) {

            throw new IllegalStateException(
                    "Flight is already cancelled"
            );
        }

>>>>>>> origin/develop
        flight.setStatus("CANCELLED");

        return flightRepository.save(flight);
    }

    @Transactional
    public void deleteFlight(Long id) {

        Flight flight = getFlightById(id);

        if ("IN_PROGRESS".equalsIgnoreCase(
                flight.getStatus()
        )) {
<<<<<<< HEAD
            throw new RuntimeException(
=======

            throw new IllegalStateException(
>>>>>>> origin/develop
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