package com.flightsimulation.service;

import com.flightsimulation.entity.Telemetry;
import com.flightsimulation.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class TelemetryIngestionService {

    private static final Logger logger = LoggerFactory.getLogger(TelemetryIngestionService.class);
    private boolean missingFlightReported;

    private final TelemetryService telemetryService;
    private final SimpMessagingTemplate messagingTemplate;

    public TelemetryIngestionService(
            TelemetryService telemetryService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.telemetryService = telemetryService;
        this.messagingTemplate = messagingTemplate;
    }

    public Telemetry saveAndBroadcast(Long flightId, Telemetry telemetry) {
        Telemetry saved = telemetryService.saveTelemetry(flightId, telemetry);
        messagingTemplate.convertAndSend("/topic/telemetry/" + flightId, saved);
        return saved;
    }

    // Hardware preview remains available before a flight has been created.
    public void ingestLiveTelemetry(Long flightId, Telemetry telemetry) {
        try {
            saveAndBroadcast(flightId, telemetry);
            missingFlightReported = false;
        } catch (ResourceNotFoundException exception) {
            if (!missingFlightReported) {
                logger.warn("Flight {} does not exist: ESP32 telemetry is live only. Create the flight to record telemetry.", flightId);
                missingFlightReported = true;
            }
            messagingTemplate.convertAndSend("/topic/telemetry/" + flightId, telemetry);
        }
    }
}
