package com.flightsimulation.controller;

import com.flightsimulation.entity.Flight;
import com.flightsimulation.service.FlightService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "http://localhost:5173")
public class FlightController {

    private final FlightService flightService;

    public FlightController(
            FlightService flightService
    ) {
        this.flightService = flightService;
    }

    @GetMapping
    public ResponseEntity<List<Flight>>
    getAllFlights() {

        return ResponseEntity.ok(
                flightService.getAllFlights()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight>
    getFlightById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                flightService.getFlightById(id)
        );
    }

    // ==========================================
    // Sprint 2 - Flight History
    // ==========================================

    @GetMapping("/history")
    public ResponseEntity<List<Flight>>
    getFlightHistory(
            @RequestParam(required = false) Long aircraftId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDateTime start,
            @RequestParam(required = false) LocalDateTime end
    ) {

        return ResponseEntity.ok(
                flightService.getFlightHistory(
                        aircraftId,
                        status,
                        start,
                        end
                )
        );
    }

    @PostMapping
    public ResponseEntity<Flight>
    createFlight(
            @RequestParam Long aircraftId,
            @Valid @RequestBody Flight flight
    ) {

        Flight saved =
                flightService.createFlight(
                        flight,
                        aircraftId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Flight>
    updateFlight(
            @PathVariable Long id,
            @RequestParam Long aircraftId,
            @Valid @RequestBody Flight flight
    ) {

        return ResponseEntity.ok(
                flightService.updateFlight(
                        id,
                        flight,
                        aircraftId
                )
        );
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<Flight>
    startFlight(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                flightService.startFlight(id)
        );
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<Flight>
    completeFlight(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                flightService.completeFlight(id)
        );
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Flight>
    cancelFlight(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                flightService.cancelFlight(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteFlight(
            @PathVariable Long id
    ) {

        flightService.deleteFlight(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}