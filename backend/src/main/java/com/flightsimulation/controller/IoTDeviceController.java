package com.flightsimulation.controller;

import com.flightsimulation.entity.IoTDevice;
import com.flightsimulation.service.IoTDeviceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/iot-devices")
@CrossOrigin(origins = "http://localhost:5173")
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
            @RequestBody IoTDevice device
    ) {

        return ResponseEntity.ok(
                service.registerOrUpdate(device)
        );
    }
}