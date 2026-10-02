package com.flightsimulation.service;

import com.flightsimulation.entity.Flight;
import com.flightsimulation.entity.Telemetry;
import com.flightsimulation.repository.FlightRepository;
import com.flightsimulation.repository.TelemetryRepository;

import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

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

        if (!flightRepository.existsById(flightId)) {
            throw new RuntimeException(
                    "Flight not found with id: " + flightId
            );
        }

        return telemetryRepository
                .findByFlightIdOrderByRecordedAtDesc(
                        flightId
                );
    }

    // ==========================================
    // Sprint 2 - Telemetry Summary Report
    // ==========================================

    public Map<String, Object> getTelemetrySummary(
            Long flightId
    ) {

        Flight flight = flightRepository
                .findById(flightId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Flight not found with id: " + flightId
                        )
                );

        List<Telemetry> telemetryList =
                telemetryRepository
                        .findByFlightIdOrderByRecordedAtDesc(
                                flightId
                        );

        Map<String, Object> summary =
                new LinkedHashMap<>();

        summary.put("flightId", flight.getId());
        summary.put("flightNumber", flight.getFlightNumber());
        summary.put("status", flight.getStatus());
        summary.put("recordCount", telemetryList.size());

        if (telemetryList.isEmpty()) {

            summary.put("averageAltitude", 0.0);
            summary.put("maxAltitude", 0.0);

            summary.put("averageSpeed", 0.0);
            summary.put("maxSpeed", 0.0);

            summary.put("minimumFuel", 0.0);

            return summary;
        }

        double averageAltitude =
                telemetryList.stream()
                        .mapToDouble(Telemetry::getAltitude)
                        .average()
                        .orElse(0.0);

        double maxAltitude =
                telemetryList.stream()
                        .mapToDouble(Telemetry::getAltitude)
                        .max()
                        .orElse(0.0);

        double averageSpeed =
                telemetryList.stream()
                        .mapToDouble(Telemetry::getSpeed)
                        .average()
                        .orElse(0.0);

        double maxSpeed =
                telemetryList.stream()
                        .mapToDouble(Telemetry::getSpeed)
                        .max()
                        .orElse(0.0);

        double minimumFuel =
                telemetryList.stream()
                        .mapToDouble(Telemetry::getFuel)
                        .min()
                        .orElse(0.0);

        summary.put(
                "averageAltitude",
                averageAltitude
        );

        summary.put(
                "maxAltitude",
                maxAltitude
        );

        summary.put(
                "averageSpeed",
                averageSpeed
        );

        summary.put(
                "maxSpeed",
                maxSpeed
        );

        summary.put(
                "minimumFuel",
                minimumFuel
        );

        return summary;
    }

    // ==========================================
    // Sprint 2 - CSV Export
    // ==========================================

    public String exportTelemetryToCsv(
            Long flightId
    ) {

        Flight flight = flightRepository
                .findById(flightId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Flight not found with id: " + flightId
                        )
                );

        List<Telemetry> telemetryList =
                telemetryRepository
                        .findByFlightIdOrderByRecordedAtDesc(
                                flightId
                        );

        StringBuilder csv =
                new StringBuilder();

        csv.append("Flight ID,");
        csv.append(flight.getId());
        csv.append("\n");

        csv.append("Flight Number,");
        csv.append(flight.getFlightNumber());
        csv.append("\n");

        csv.append("Status,");
        csv.append(flight.getStatus());
        csv.append("\n\n");

        csv.append(
                "recordedAt,altitude,speed,pitch,roll,heading,throttle,fuel\n"
        );

        for (Telemetry telemetry : telemetryList) {

            csv.append(
                    telemetry.getRecordedAt() != null
                            ? telemetry.getRecordedAt()
                            : ""
            );
            csv.append(",");

            csv.append(
                    telemetry.getAltitude() != null
                            ? telemetry.getAltitude()
                            : ""
            );
            csv.append(",");

            csv.append(
                    telemetry.getSpeed() != null
                            ? telemetry.getSpeed()
                            : ""
            );
            csv.append(",");

            csv.append(
                    telemetry.getPitch() != null
                            ? telemetry.getPitch()
                            : ""
            );
            csv.append(",");

            csv.append(
                    telemetry.getRoll() != null
                            ? telemetry.getRoll()
                            : ""
            );
            csv.append(",");

            csv.append(
                    telemetry.getHeading() != null
                            ? telemetry.getHeading()
                            : ""
            );
            csv.append(",");

            csv.append(
                    telemetry.getThrottle() != null
                            ? telemetry.getThrottle()
                            : ""
            );
            csv.append(",");

            csv.append(
                    telemetry.getFuel() != null
                            ? telemetry.getFuel()
                            : ""
            );

            csv.append("\n");
        }

        return csv.toString();
    }
}