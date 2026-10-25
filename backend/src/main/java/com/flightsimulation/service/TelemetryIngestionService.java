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

    private final HardwareTelemetryRecorder recorder;
    private final TelemetryService telemetryService;
    private final SimpMessagingTemplate messagingTemplate;

    public TelemetryIngestionService(
            TelemetryService telemetryService,
            SimpMessagingTemplate messagingTemplate, HardwareTelemetryRecorder recorder
    ) {
        this.recorder = recorder;
        this.telemetryService = telemetryService;
        this.messagingTemplate = messagingTemplate;
    }

    public Telemetry saveAndBroadcast(Long flightId, Telemetry telemetry) {
        Telemetry saved = telemetryService.saveTelemetry(flightId, telemetry);
        messagingTemplate.convertAndSend("/topic/telemetry/" + flightId, saved);
        return saved;
    }

    public void ingestLiveTelemetry(Long flightId, Telemetry telemetry) {
        telemetry.setRecordedAt(java.time.LocalDateTime.now());
        // Publish before handing a separate copy to the cloud recording worker.
        messagingTemplate.convertAndSend("/topic/telemetry/" + flightId, telemetry);
        recorder.record(flightId,telemetry);
    }
}
