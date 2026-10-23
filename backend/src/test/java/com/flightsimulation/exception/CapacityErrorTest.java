package com.flightsimulation.exception;
import org.junit.jupiter.api.Test;
import org.springframework.core.task.TaskRejectedException;
import static org.junit.jupiter.api.Assertions.*;
class CapacityErrorTest {
 @Test void returnsRetryableSanitizedResponse(){
  var response=new GlobalExceptionHandler().handleCapacityExceeded(new TaskRejectedException("private executor details"));
  assertEquals(503,response.getStatusCode().value());assertEquals("5",response.getHeaders().getFirst("Retry-After"));assertEquals("no-store",response.getHeaders().getFirst("Cache-Control"));
  assertEquals("The server is busy. Please retry shortly.",response.getBody().get("error"));
 }
 @org.springframework.web.bind.annotation.RestController
 static class BusyController {
  @org.springframework.web.bind.annotation.GetMapping("/busy") public String busy(){throw new TaskRejectedException("private executor details");}
 }
 @Test void mapsRejectedHttpRequestTo503()throws Exception {
  var mvc=org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup(new BusyController()).setControllerAdvice(new GlobalExceptionHandler()).build();
  mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/busy"))
   .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.status().isServiceUnavailable())
   .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header().string("Retry-After","5"))
   .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath("$.error").value("The server is busy. Please retry shortly."));
 }
}
