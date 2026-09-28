package com.flightsimulation.service;

import com.flightsimulation.entity.Flight;
import com.flightsimulation.entity.Telemetry;
import com.flightsimulation.repository.FlightRepository;
import com.flightsimulation.repository.TelemetryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TelemetryService {

    private final TelemetryRepository telemetryRepository;
    private final FlightRepository flightRepository;

    public TelemetryService(
            TelemetryRepository telemetryRepository,
            FlightRepository flightRepository
    ) {
        this.telemetryRepository = telemetryRepository;
        this.flightRepository = flightRepository;
    }

    public Telemetry saveTelemetry(
            Long flightId,
            Telemetry telemetry
    ) {

        Flight flight = flightRepository
                .findById(flightId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Flight not found with id: " + flightId
                        )
                );

        telemetry.setFlight(flight);

        return telemetryRepository.save(telemetry);
    }

    public List<Telemetry> getTelemetryByFlight(
            Long flightId
    ) {

        return telemetryRepository
                .findByFlightIdOrderByRecordedAtDesc(
                        flightId
                );
    }
}