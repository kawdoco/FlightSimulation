package com.flightsimulation.config;
import org.slf4j.MDC;
import org.springframework.core.task.TaskDecorator;
import java.util.Map;
public class RequestContextTaskDecorator implements TaskDecorator {
 @Override public Runnable decorate(Runnable task){
  Map<String,String> captured=MDC.getCopyOfContextMap();
  return ()->{
   Map<String,String> previous=MDC.getCopyOfContextMap();
   try{if(captured==null)MDC.clear();else MDC.setContextMap(captured);task.run();}
   finally{if(previous==null)MDC.clear();else MDC.setContextMap(previous);}
  };
 }
}
