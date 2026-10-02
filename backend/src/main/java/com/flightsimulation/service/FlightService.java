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

        if (!"SCHEDULED".equalsIgnoreCase(existing.getStatus())) {
            throw new IllegalStateException(
                    "Only a scheduled flight can be updated"
            );
        }

        if (!java.util.Objects.equals(
                existing.getFlightNumber(),
                updatedFlight.getFlightNumber()
        ) && flightRepository.existsByFlightNumber(
                updatedFlight.getFlightNumber()
        )) {
            throw new DuplicateResourceException(
                    "Flight number already exists"
            );
        }

        Aircraft aircraft = getAircraftById(aircraftId);
        validateAircraftAvailability(aircraft);

        existing.setFlightNumber(updatedFlight.getFlightNumber());
        existing.setDeparture(updatedFlight.getDeparture());
        existing.setDestination(updatedFlight.getDestination());
        existing.setScheduledTime(updatedFlight.getScheduledTime());
        existing.setAircraft(aircraft);

        return flightRepository.save(existing);
    }

    @Transactional
    public Flight startFlight(Long id) {
        Flight flight = getFlightById(id);

        if (!"SCHEDULED".equalsIgnoreCase(flight.getStatus())) {
            throw new IllegalStateException(
                    "Only a scheduled flight can be started"
            );
        }

        Aircraft aircraft = flight.getAircraft();
        validateAircraftAvailability(aircraft);

        aircraft.setStatus("IN_FLIGHT");
        aircraftRepository.save(aircraft);

        flight.setStatus("IN_PROGRESS");
        flight.setStartTime(LocalDateTime.now());

        return flightRepository.save(flight);
    }

    @Transactional
    public Flight completeFlight(Long id) {
        Flight flight = getFlightById(id);

        if (!"IN_PROGRESS".equalsIgnoreCase(flight.getStatus())) {
            throw new IllegalStateException(
                    "Only an in-progress flight can be completed"
            );
        }

        Aircraft aircraft = flight.getAircraft();

        // Preserve maintenance/out-of-service status if another
        // module has changed it while the flight was active.
        if ("IN_FLIGHT".equalsIgnoreCase(aircraft.getStatus())) {
            aircraft.setStatus("AVAILABLE");
            aircraftRepository.save(aircraft);
        }

        flight.setStatus("COMPLETED");
        flight.setEndTime(LocalDateTime.now());

        return flightRepository.save(flight);
    }

    @Transactional
    public Flight cancelFlight(Long id) {
        Flight flight = getFlightById(id);

        if (!"SCHEDULED".equalsIgnoreCase(flight.getStatus())) {
            throw new IllegalStateException(
                    "Only a scheduled flight can be cancelled"
            );
        }

        flight.setStatus("CANCELLED");

        return flightRepository.save(flight);
    }

    @Transactional
    public void deleteFlight(Long id) {
        Flight flight = getFlightById(id);

        if ("IN_PROGRESS".equalsIgnoreCase(flight.getStatus())) {
            throw new IllegalStateException(
                    "Cannot delete an active flight"
            );
        }

        flightRepository.delete(flight);
    }

    public List<Flight> getFlightHistory(
            Long aircraftId,
            String status,
            LocalDateTime start,
            LocalDateTime end
    ) {
        boolean hasStatus = status != null && !status.isBlank();
        boolean hasDateRange = start != null && end != null;

        if ((start == null) != (end == null)) {
            throw new IllegalArgumentException(
                    "Both start and end dates are required for a date range"
            );
        }

        if (hasDateRange && start.isAfter(end)) {
            throw new IllegalArgumentException(
                    "Start date must not be after end date"
            );
        }

        if (aircraftId != null && hasStatus && hasDateRange) {
            return flightRepository
                    .findByAircraftIdAndStatusAndScheduledTimeBetween(
                            aircraftId, status, start, end
                    );
        }

        if (aircraftId != null && hasStatus) {
            return flightRepository.findByAircraftIdAndStatus(
                    aircraftId, status
            );
        }

        if (aircraftId != null && hasDateRange) {
            return flightRepository
                    .findByAircraftIdAndScheduledTimeBetween(
                            aircraftId, start, end
                    );
        }

        if (hasStatus && hasDateRange) {
            return flightRepository
                    .findByStatusAndScheduledTimeBetween(
                            status, start, end
                    );
        }

        if (aircraftId != null) {
            return flightRepository.findByAircraftId(aircraftId);
        }

        if (hasStatus) {
            return flightRepository.findByStatus(status);
        }

        if (hasDateRange) {
            return flightRepository.findByScheduledTimeBetween(
                    start, end
            );
        }

        return flightRepository.findAll();
    }
}