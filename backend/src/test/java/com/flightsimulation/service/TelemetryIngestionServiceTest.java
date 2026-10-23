package com.flightsimulation.service;

import com.flightsimulation.entity.Telemetry;
import com.flightsimulation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.mockito.Mockito.*;

class TelemetryIngestionServiceTest {
    private final TelemetryService storage = mock(TelemetryService.class);
    private final SimpMessagingTemplate messaging = mock(SimpMessagingTemplate.class);
    private final TelemetryIngestionService ingestion = new TelemetryIngestionService(storage, messaging);

    @Test
    void hardwareCanDrivePreviewWithoutAnExistingFlight() {
        Telemetry packet = new Telemetry();
        when(storage.saveTelemetry(1L, packet)).thenThrow(new ResourceNotFoundException("Flight not found"));

        ingestion.ingestLiveTelemetry(1L, packet);

        verify(messaging).convertAndSend("/topic/telemetry/1", packet);
    }

    @Test
    void existingFlightBroadcastsTheSavedPacketOnce() {
        Telemetry packet = new Telemetry();
        Telemetry saved = new Telemetry();
        when(storage.saveTelemetry(1L, packet)).thenReturn(saved);

        ingestion.ingestLiveTelemetry(1L, packet);

        verify(messaging).convertAndSend("/topic/telemetry/1", saved);
        verifyNoMoreInteractions(messaging);
    }
}
