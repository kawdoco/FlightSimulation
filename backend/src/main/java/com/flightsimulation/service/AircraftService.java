package com.flightsimulation.service;

import com.flightsimulation.entity.Aircraft;
<<<<<<< HEAD
import com.flightsimulation.repository.AircraftRepository;
=======
import com.flightsimulation.exception.DuplicateResourceException;
import com.flightsimulation.exception.ResourceNotFoundException;
import com.flightsimulation.repository.AircraftRepository;
import com.flightsimulation.repository.FlightRepository;
>>>>>>> origin/develop
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AircraftService {

    private final AircraftRepository aircraftRepository;
<<<<<<< HEAD

    public AircraftService(AircraftRepository aircraftRepository) {
        this.aircraftRepository = aircraftRepository;
=======
    private final FlightRepository flightRepository;

    public AircraftService(
            AircraftRepository aircraftRepository,
            FlightRepository flightRepository
    ) {
        this.aircraftRepository = aircraftRepository;
        this.flightRepository = flightRepository;
>>>>>>> origin/develop
    }

    public List<Aircraft> getAllAircraft() {
        return aircraftRepository.findAll();
    }

    public Aircraft getAircraftById(Long id) {
        return aircraftRepository.findById(id)
                .orElseThrow(() ->
<<<<<<< HEAD
                        new RuntimeException("Aircraft not found with id: " + id));
=======
                        new ResourceNotFoundException(
                                "Aircraft not found with id: " + id
                        )
                );
>>>>>>> origin/develop
    }

    public Aircraft createAircraft(Aircraft aircraft) {

        if (aircraftRepository.existsByRegistrationNumber(
<<<<<<< HEAD
                aircraft.getRegistrationNumber())) {

            throw new RuntimeException(
                    "Aircraft registration number already exists");
=======
                aircraft.getRegistrationNumber()
        )) {

            throw new DuplicateResourceException(
                    "Aircraft registration number already exists"
            );
>>>>>>> origin/develop
        }

        return aircraftRepository.save(aircraft);
    }

<<<<<<< HEAD
    public Aircraft updateAircraft(Long id, Aircraft updatedAircraft) {

        Aircraft existingAircraft = getAircraftById(id);

        existingAircraft.setRegistrationNumber(
                updatedAircraft.getRegistrationNumber());

        existingAircraft.setModel(
                updatedAircraft.getModel());

        existingAircraft.setManufacturer(
                updatedAircraft.getManufacturer());

        existingAircraft.setStatus(
                updatedAircraft.getStatus());

        existingAircraft.setFuelCapacity(
                updatedAircraft.getFuelCapacity());

        existingAircraft.setMaxSpeed(
                updatedAircraft.getMaxSpeed());

        existingAircraft.setMaxAltitude(
                updatedAircraft.getMaxAltitude());
=======
    public Aircraft updateAircraft(
            Long id,
            Aircraft updatedAircraft
    ) {

        Aircraft existingAircraft = getAircraftById(id);

        if (aircraftRepository.existsByRegistrationNumberAndIdNot(
                updatedAircraft.getRegistrationNumber(),
                id
        )) {

            throw new DuplicateResourceException(
                    "Aircraft registration number already exists"
            );
        }

        /*
         * Aircraft that is currently in flight should not
         * have its availability status manually changed.
         */
        if ("IN_FLIGHT".equalsIgnoreCase(existingAircraft.getStatus())
                && !existingAircraft.getStatus()
                .equalsIgnoreCase(updatedAircraft.getStatus())) {

            throw new IllegalStateException(
                    "Cannot change the status of an aircraft while it is in flight"
            );
        }

        existingAircraft.setRegistrationNumber(
                updatedAircraft.getRegistrationNumber()
        );

        existingAircraft.setModel(
                updatedAircraft.getModel()
        );

        existingAircraft.setManufacturer(
                updatedAircraft.getManufacturer()
        );

        existingAircraft.setStatus(
                updatedAircraft.getStatus()
        );

        existingAircraft.setFuelCapacity(
                updatedAircraft.getFuelCapacity()
        );

        existingAircraft.setMaxSpeed(
                updatedAircraft.getMaxSpeed()
        );

        existingAircraft.setMaxAltitude(
                updatedAircraft.getMaxAltitude()
        );
>>>>>>> origin/develop

        return aircraftRepository.save(existingAircraft);
    }

    public void deleteAircraft(Long id) {
<<<<<<< HEAD
        Aircraft aircraft = getAircraftById(id);
=======

        Aircraft aircraft = getAircraftById(id);

        /*
         * Prevent deleting an aircraft that is currently
         * being used in a flight.
         */
        if ("IN_FLIGHT".equalsIgnoreCase(aircraft.getStatus())) {

            throw new IllegalStateException(
                    "Cannot delete an aircraft while it is in flight"
            );
        }

        /*
         * Prevent orphan flight records.
         */
        if (flightRepository.existsByAircraftId(id)) {

            throw new IllegalStateException(
                    "Cannot delete aircraft because it is linked to flight records"
            );
        }

>>>>>>> origin/develop
        aircraftRepository.delete(aircraft);
    }
}