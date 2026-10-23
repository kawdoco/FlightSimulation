package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.*;
import static org.junit.jupiter.api.Assertions.*;
class AuthenticationThrottleTest {
 @Test void blocksAfterTenFailuresAndSeparatesSources()throws Exception{
  var filter=new AuthenticationThrottle();
  for(int i=0;i<11;i++){var req=new MockHttpServletRequest("GET","/api/auth/me");req.addHeader("Authorization","Basic invalid");var res=new MockHttpServletResponse();filter.doFilter(req,res,(a,b)->((jakarta.servlet.http.HttpServletResponse)b).setStatus(401));assertEquals(i<10?401:429,res.getStatus());}
  var req=new MockHttpServletRequest("GET","/api/auth/me");req.setRemoteAddr("10.0.0.2");req.addHeader("Authorization","Basic invalid");var res=new MockHttpServletResponse();filter.doFilter(req,res,(a,b)->((jakarta.servlet.http.HttpServletResponse)b).setStatus(401));assertEquals(401,res.getStatus());
 }
}
