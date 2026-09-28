package com.flightsimulation.controller;

import com.flightsimulation.entity.Aircraft;
import com.flightsimulation.service.AircraftService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/aircraft")
@CrossOrigin(origins = "http://localhost:5173")
public class AircraftController {

    private final AircraftService aircraftService;

    public AircraftController(AircraftService aircraftService) {
        this.aircraftService = aircraftService;
    }

    @GetMapping
    public ResponseEntity<List<Aircraft>> getAllAircraft() {
        return ResponseEntity.ok(
                aircraftService.getAllAircraft());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aircraft> getAircraftById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                aircraftService.getAircraftById(id));
    }

    @PostMapping
    public ResponseEntity<Aircraft> createAircraft(
            @Valid @RequestBody Aircraft aircraft) {

        Aircraft savedAircraft =
                aircraftService.createAircraft(aircraft);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedAircraft);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Aircraft> updateAircraft(
            @PathVariable Long id,
            @Valid @RequestBody Aircraft aircraft) {

        return ResponseEntity.ok(
                aircraftService.updateAircraft(id, aircraft));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAircraft(
            @PathVariable Long id) {

        aircraftService.deleteAircraft(id);

        return ResponseEntity.noContent().build();
    }
}