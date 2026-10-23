package com.flightsimulation.controller;

import com.flightsimulation.entity.IoTDevice;
import com.flightsimulation.service.IoTDeviceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/iot-devices")
@CrossOrigin(origins = "${app.frontend.url}", exposedHeaders = "X-Request-ID")
public class IoTDeviceController {

    private final IoTDeviceService service;

    public IoTDeviceController(
            IoTDeviceService service
    ) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<IoTDevice>>
    getAllDevices() {

        return ResponseEntity.ok(
                service.getAllDevices()
        );
    }

    @PostMapping("/register")
    public ResponseEntity<IoTDevice>
    registerDevice(
            @jakarta.validation.Valid @RequestBody com.flightsimulation.dto.DeviceRegistrationRequest device
    ) {

        return ResponseEntity.ok(
                service.registerOrUpdate(device.toEntity())
        );
    }
}
