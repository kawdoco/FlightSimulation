package com.flightsimulation.controller;

import com.flightsimulation.service.HardwareSession;
import com.flightsimulation.service.HardwareTelemetryRecorder;
import com.flightsimulation.repository.FlightRepository;
import com.flightsimulation.exception.ResourceNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hardware")
@CrossOrigin(origins = "${app.frontend.url}")
public class HardwareController {
    private final HardwareSession session;
    private final FlightRepository flights;
    private final HardwareTelemetryRecorder recorder;
    public HardwareController(HardwareSession session, FlightRepository flights, HardwareTelemetryRecorder recorder) {
        this.session = session; this.flights = flights; this.recorder = recorder;
    }
    @GetMapping public java.util.Map<String, Object> status() {
        var result = session.status();
        result.put("recording", recorder.status());
        return result;
    }
    public record Selection(@jakarta.validation.constraints.Positive long flightId) {}
    @PutMapping("/flight") public java.util.Map<String, Object> select(@jakarta.validation.Valid @RequestBody Selection input) {
        if (!flights.existsById(input.flightId())) throw new ResourceNotFoundException("Flight not found");
        session.selectFlight(input.flightId());
        return status();
    }
}
