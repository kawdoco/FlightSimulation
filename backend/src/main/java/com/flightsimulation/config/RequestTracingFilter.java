package com.flightsimulation.config;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.MDC;
import java.io.IOException;
import java.util.UUID;
/** Server-generated IDs avoid trusting arbitrary request headers in logs. */
@Component @Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestTracingFilter extends OncePerRequestFilter {
 public static final String HEADER="X-Request-ID";
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  String id=UUID.randomUUID().toString();
  String previous=MDC.get("requestId");
  response.setHeader(HEADER,id);MDC.put("requestId",id);
  try{chain.doFilter(request,response);}
  finally{if(previous==null)MDC.remove("requestId");else MDC.put("requestId",previous);}
 }
}
