package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import static org.junit.jupiter.api.Assertions.*;
class RequestContextTaskDecoratorTest {
 @Test void capturesAtSubmissionAndRestoresWorkerContext(){
  try{
   MDC.put("requestId","request-one");
   Runnable task=new RequestContextTaskDecorator().decorate(()->assertEquals("request-one",MDC.get("requestId")));
   MDC.put("requestId","worker-context");task.run();assertEquals("worker-context",MDC.get("requestId"));
  }finally{MDC.clear();}
 }
 @Test void restoresEvenWhenTaskFails(){
  try{MDC.put("requestId","one");Runnable task=new RequestContextTaskDecorator().decorate(()->{throw new IllegalStateException("failure");});MDC.clear();assertThrows(IllegalStateException.class,task::run);assertNull(MDC.getCopyOfContextMap());}finally{MDC.clear();}
 }
 @Test void missingSubmissionContextDoesNotLeakWorkerValues(){
  try{MDC.clear();Runnable task=new RequestContextTaskDecorator().decorate(()->assertNull(MDC.get("requestId")));MDC.put("requestId","worker");task.run();assertEquals("worker",MDC.get("requestId"));}finally{MDC.clear();}
 }
}
