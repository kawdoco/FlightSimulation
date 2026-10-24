package com.flightsimulation.service;
import com.flightsimulation.entity.Telemetry;
import org.junit.jupiter.api.Test;
import java.util.concurrent.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class HardwareTelemetryRecorderTest {
 @Test void slowDatabaseKeepsOnlyLatestPendingSample()throws Exception{
  var storage=mock(TelemetryService.class);var entered=new CountDownLatch(1);var release=new CountDownLatch(1);var completed=new CountDownLatch(2);
  doAnswer(call->{entered.countDown();release.await(3,TimeUnit.SECONDS);completed.countDown();return call.getArgument(1);}).when(storage).saveTelemetry(eq(1L),any());
  var recorder=new HardwareTelemetryRecorder(storage);
  try{
   Telemetry first=new Telemetry();first.setSpeed(1.0);recorder.record(1L,first);assertTrue(entered.await(2,TimeUnit.SECONDS));
   Telemetry second=new Telemetry();second.setSpeed(2.0);recorder.record(1L,second);Telemetry last=new Telemetry();last.setSpeed(3.0);recorder.record(1L,last);last.setSpeed(999.0);
   release.countDown();assertTrue(completed.await(3,TimeUnit.SECONDS));
   var samples=org.mockito.ArgumentCaptor.forClass(Telemetry.class);verify(storage,times(2)).saveTelemetry(eq(1L),samples.capture());assertEquals(1.0,samples.getAllValues().get(0).getSpeed());assertEquals(3.0,samples.getAllValues().get(1).getSpeed());
  }finally{release.countDown();recorder.stop();}
 }
}
