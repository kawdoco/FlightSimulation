package com.flightsimulation.service;
import com.flightsimulation.entity.Telemetry;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import tools.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import java.util.concurrent.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class HardwareTelemetryRecorderTest {
 @TempDir Path directory;
 private HardwareTelemetryRecorder recorder(TelemetryService storage) {
  return new HardwareTelemetryRecorder(storage, new ObjectMapper(), directory.toString(), 100, true);
 }
 @Test void slowDatabaseRetainsEverySampleAndCopiesInput() throws Exception {
  var storage=mock(TelemetryService.class);
  var entered=new CountDownLatch(1);var release=new CountDownLatch(1);var completed=new CountDownLatch(3);
  doAnswer(call->{entered.countDown();release.await(3,TimeUnit.SECONDS);completed.countDown();return call.getArgument(1);}).when(storage).saveTelemetry(eq(1L),any());
  var recorder=recorder(storage); recorder.start();
  try {
   Telemetry first=new Telemetry();first.setSpeed(1.0);recorder.record(1L,first);assertTrue(entered.await(2,TimeUnit.SECONDS));
   Telemetry second=new Telemetry();second.setSpeed(2.0);recorder.record(1L,second);
   Telemetry last=new Telemetry();last.setSpeed(3.0);recorder.record(1L,last);last.setSpeed(999.0);
   release.countDown();assertTrue(completed.await(4,TimeUnit.SECONDS));
   var samples=org.mockito.ArgumentCaptor.forClass(Telemetry.class);verify(storage,times(3)).saveTelemetry(eq(1L),samples.capture());
   assertEquals(java.util.List.of(1.0,2.0,3.0),samples.getAllValues().stream().map(Telemetry::getSpeed).toList());
  } finally {release.countDown();recorder.stop();}
 }
 @Test void pendingSampleSurvivesRestartAndRetriesSameKey() throws Exception {
  var storage=mock(TelemetryService.class);
  when(storage.saveTelemetry(anyLong(),any())).thenThrow(new IllegalStateException("offline"));
  var first=recorder(storage);first.start();
  Telemetry packet=new Telemetry();packet.setSpeed(22.0);first.record(7L,packet);
  verify(storage,timeout(3000).atLeastOnce()).saveTelemetry(eq(7L),any());first.stop();
  assertEquals(1L,first.status().get("pending"));
  var keys=org.mockito.ArgumentCaptor.forClass(Telemetry.class);verify(storage,atLeastOnce()).saveTelemetry(eq(7L),keys.capture());
  String key=keys.getValue().getIngestKey();
  var recovered=mock(TelemetryService.class);var second=recorder(recovered);second.start();
  try {verify(recovered,timeout(3000)).saveTelemetry(eq(7L),argThat(t->key.equals(t.getIngestKey()) && t.getSpeed()==22.0));}
  finally {second.stop();}
 }
 @Test void fullSpoolReportsErrorWithoutDeletingAcceptedSamples() {
  var recorder=new HardwareTelemetryRecorder(mock(TelemetryService.class),new ObjectMapper(),directory.toString(),1,true);
  try {recorder.record(1L,new Telemetry());recorder.record(1L,new Telemetry());assertEquals(1L,recorder.status().get("pending"));assertNotNull(recorder.status().get("error"));}
  finally {recorder.stop();}
 }
}
