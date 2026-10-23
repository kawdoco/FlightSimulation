package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import org.slf4j.MDC;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
class RequestTracingFilterTest {
 @Test void assignsServerIdAndRestoresContext()throws Exception{
  var request=new MockHttpServletRequest();request.addHeader("X-Request-ID","untrusted-client-value");var response=new MockHttpServletResponse();
  MDC.put("requestId","outer");
  try{new RequestTracingFilter().doFilter(request,response,(req,res)->{
   String id=response.getHeader("X-Request-ID");assertNotNull(UUID.fromString(id));assertEquals(id,MDC.get("requestId"));assertNotEquals("untrusted-client-value",id);
  });assertEquals("outer",MDC.get("requestId"));}finally{MDC.remove("requestId");}
 }
 @Test void clearsContextEvenWhenRequestFails(){
  MDC.remove("requestId");
  assertThrows(jakarta.servlet.ServletException.class,()->new RequestTracingFilter().doFilter(new MockHttpServletRequest(),new MockHttpServletResponse(),(req,res)->{throw new jakarta.servlet.ServletException("test");}));
  assertNull(MDC.get("requestId"));
 }
}
