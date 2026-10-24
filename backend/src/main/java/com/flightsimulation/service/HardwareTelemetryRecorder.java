package com.flightsimulation.service;
import com.flightsimulation.entity.Telemetry;
import org.springframework.stereotype.Service;
import jakarta.annotation.PreDestroy;
import java.util.concurrent.*;
/** Hardware recording is sampled under DB backpressure; live controls never wait for it. */
@Service
public class HardwareTelemetryRecorder {
 private final TelemetryService storage;
 private final ThreadPoolExecutor worker=new ThreadPoolExecutor(1,1,0,TimeUnit.MILLISECONDS,
  new ArrayBlockingQueue<>(1),r->{Thread t=new Thread(r,"hardware-recording");t.setDaemon(true);return t;},new ThreadPoolExecutor.DiscardOldestPolicy());
 public HardwareTelemetryRecorder(TelemetryService storage){this.storage=storage;}
 public void record(Long flightId,Telemetry input){
  Telemetry sample=new Telemetry();sample.setAltitude(input.getAltitude());sample.setSpeed(input.getSpeed());sample.setPitch(input.getPitch());sample.setRoll(input.getRoll());sample.setHeading(input.getHeading());sample.setThrottle(input.getThrottle());sample.setFuel(input.getFuel());sample.setRecordedAt(input.getRecordedAt());
  worker.execute(()->{try{storage.saveTelemetry(flightId,sample);}catch(RuntimeException ex){org.slf4j.LoggerFactory.getLogger(HardwareTelemetryRecorder.class).warn("Hardware sample not recorded for flight {}: {}",flightId,ex.getClass().getSimpleName());}});
 }
 @PreDestroy public void stop(){worker.shutdownNow();}
}
