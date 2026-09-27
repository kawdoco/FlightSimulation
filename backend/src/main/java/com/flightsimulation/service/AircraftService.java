package com.flightsimulation.service;

import com.flightsimulation.entity.Aircraft;
import com.flightsimulation.exception.DuplicateResourceException;
import com.flightsimulation.exception.ResourceNotFoundException;
import com.flightsimulation.repository.AircraftRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AircraftService {

    private final AircraftRepository aircraftRepository;

    public AircraftService(AircraftRepository aircraftRepository) {
        this.aircraftRepository = aircraftRepository;
    }

    public List<Aircraft> getAllAircraft() {
        return aircraftRepository.findAll();
    }

    public Aircraft getAircraftById(Long id) {
        return aircraftRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Aircraft not found with id: " + id
                        )
                );
    }

    public Aircraft createAircraft(Aircraft aircraft) {

        if (aircraftRepository.existsByRegistrationNumber(
                aircraft.getRegistrationNumber())) {

            throw new DuplicateResourceException(
                    "Aircraft registration number already exists"
            );
        }

        return aircraftRepository.save(aircraft);
    }

    public Aircraft updateAircraft(
            Long id,
            Aircraft updatedAircraft
    ) {

        Aircraft existingAircraft = getAircraftById(id);

        if (aircraftRepository.existsByRegistrationNumberAndIdNot(
                updatedAircraft.getRegistrationNumber(),
                id)) {

            throw new DuplicateResourceException(
                    "Aircraft registration number already exists"
            );
        }

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

        return aircraftRepository.save(existingAircraft);
    }

    public void deleteAircraft(Long id) {

        Aircraft aircraft = getAircraftById(id);

        aircraftRepository.delete(aircraft);
    }
}