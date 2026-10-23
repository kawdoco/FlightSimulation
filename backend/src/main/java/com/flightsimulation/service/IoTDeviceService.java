package com.flightsimulation.service;

import com.flightsimulation.entity.IoTDevice;
import com.flightsimulation.repository.IoTDeviceRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IoTDeviceService {

    private final IoTDeviceRepository repository;

    public IoTDeviceService(
            IoTDeviceRepository repository
    ) {
        this.repository = repository;
    }

    public List<IoTDevice> getAllDevices() {
        return repository.findAll();
    }

    public IoTDevice registerOrUpdate(
            IoTDevice device
    ) {

        return repository
                .findByDeviceIdentifier(
                        device.getDeviceIdentifier()
                )
                .map(existing -> {

                    existing.setDeviceName(
                            device.getDeviceName()
                    );

                    existing.setDeviceType(
                            device.getDeviceType()
                    );

                    existing.setStatus("ONLINE");

                    existing.setIpAddress(
                            device.getIpAddress()
                    );

                    existing.setLastSeen(
                            LocalDateTime.now()
                    );

                    return repository.save(existing);
                })
                .orElseGet(() -> {

                    device.setStatus("ONLINE");

                    device.setLastSeen(
                            LocalDateTime.now()
                    );

                    return repository.save(device);
                });
    }
}