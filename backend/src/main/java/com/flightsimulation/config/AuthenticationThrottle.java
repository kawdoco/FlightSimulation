package com.flightsimulation.config;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.core.annotation.Order;
import org.springframework.core.Ordered;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.HashMap;
/** Single-instance, source-IP failure throttle. Forwarded headers are not trusted. */
@Component @Order(Ordered.HIGHEST_PRECEDENCE+1)
public class AuthenticationThrottle extends OncePerRequestFilter {
 private record Window(long expires,int failures){}
 private final HashMap<String,Window> failures=new HashMap<>();
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{
  String auth=request.getHeader("Authorization");
  if(!request.getRequestURI().startsWith("/api/")||auth==null||!auth.startsWith("Basic ")){chain.doFilter(request,response);return;}
  String ip=request.getRemoteAddr();long now=System.currentTimeMillis();
  synchronized(failures){
   failures.entrySet().removeIf(e->e.getValue().expires<=now);
   Window window=failures.get(ip);
   if((window!=null&&window.failures>=10)||(window==null&&failures.size()>=10000)){
    response.setStatus(429);response.setHeader("Retry-After","60");response.setHeader("Cache-Control","no-store");response.setContentType("application/json");response.getWriter().write("{\"error\":\"Too many failed sign-in attempts. Retry shortly.\"}");return;
   }
  }
  chain.doFilter(request,response);
  if(response.getStatus()==401)synchronized(failures){
   Window previous=failures.get(ip);
   if(previous!=null||failures.size()<10000)failures.put(ip,new Window(previous==null?now+60000:previous.expires,previous==null?1:previous.failures+1));
  }
 }
}
