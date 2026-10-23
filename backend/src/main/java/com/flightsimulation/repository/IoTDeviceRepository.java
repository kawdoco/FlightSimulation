package com.flightsimulation.repository;

import com.flightsimulation.entity.IoTDevice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface IoTDeviceRepository
        extends JpaRepository<IoTDevice, Long> {

    Optional<IoTDevice> findByDeviceIdentifier(
            String deviceIdentifier
    );
}