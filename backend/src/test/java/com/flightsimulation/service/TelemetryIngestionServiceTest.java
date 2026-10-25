package com.flightsimulation.service;
import com.flightsimulation.entity.Telemetry;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class TelemetryIngestionServiceTest {
 @Test void liveControlsPublishBeforeAsynchronousRecording(){
  var storage=mock(TelemetryService.class);var messages=mock(SimpMessagingTemplate.class);var recorder=mock(HardwareTelemetryRecorder.class);
  Telemetry packet=new Telemetry();new TelemetryIngestionService(storage,messages,recorder).ingestLiveTelemetry(1L,packet);
  var order=inOrder(messages,recorder);order.verify(messages).convertAndSend("/topic/telemetry/1",packet);order.verify(recorder).record(1L,packet);verifyNoInteractions(storage);assertNotNull(packet.getRecordedAt());
 }
 @Test void restWritesRetainSaveThenBroadcastContract(){
  var storage=mock(TelemetryService.class);var messages=mock(SimpMessagingTemplate.class);var recorder=mock(HardwareTelemetryRecorder.class);Telemetry packet=new Telemetry();Telemetry saved=new Telemetry();when(storage.saveTelemetry(1L,packet)).thenReturn(saved);
  assertSame(saved,new TelemetryIngestionService(storage,messages,recorder).saveAndBroadcast(1L,packet));verify(messages).convertAndSend("/topic/telemetry/1",saved);verifyNoInteractions(recorder);
 }
}
