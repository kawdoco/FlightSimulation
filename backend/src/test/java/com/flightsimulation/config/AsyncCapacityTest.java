package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.core.task.TaskRejectedException;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
class AsyncCapacityTest {
 @Test void rejectsBeyondThreadAndQueueLimits()throws Exception {
  var executor=new AsyncWebConfig().streamingExecutor();executor.initialize();
  var release=new CountDownLatch(1);var started=new CountDownLatch(8);
  Runnable work=()->{started.countDown();try{release.await();}catch(InterruptedException ex){Thread.currentThread().interrupt();}};
  try{
   for(int i=0;i<40;i++)executor.execute(work);
   assertTrue(started.await(5,TimeUnit.SECONDS));
   assertEquals(8,executor.getPoolSize());assertEquals(32,executor.getQueueSize());
   assertThrows(TaskRejectedException.class,()->executor.execute(work));
  }finally{release.countDown();executor.shutdown();}
 }
}
