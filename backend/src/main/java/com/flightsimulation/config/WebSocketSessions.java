package com.flightsimulation.config;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;
import org.springframework.transaction.event.TransactionalEventListener;
import java.util.concurrent.ConcurrentHashMap;
@Component
public class WebSocketSessions {
 public record AccountChanged(String username){}
 private final ConcurrentHashMap<String,WebSocketSession> sessions=new ConcurrentHashMap<>();
 private final ConcurrentHashMap<String,String> owners=new ConcurrentHashMap<>();
 public void bind(String id,String username){if(id!=null)owners.put(id,username);}
 public WebSocketHandler decorate(WebSocketHandler handler){
  return new WebSocketHandlerDecorator(handler){
   @Override public void afterConnectionEstablished(WebSocketSession session)throws Exception{
    sessions.put(session.getId(),session);super.afterConnectionEstablished(session);
   }
   @Override public void afterConnectionClosed(WebSocketSession session,CloseStatus status)throws Exception{
    sessions.remove(session.getId());owners.remove(session.getId());super.afterConnectionClosed(session,status);
   }
  };
 }
 @TransactionalEventListener
 public void revoke(AccountChanged event){
  owners.forEach((id,owner)->{if(owner.equals(event.username())){
   var session=sessions.get(id);
   try{if(session!=null&&session.isOpen())session.close(CloseStatus.POLICY_VIOLATION);}catch(java.io.IOException ex){org.slf4j.LoggerFactory.getLogger(WebSocketSessions.class).warn("Unable to close revoked WebSocket session {}",id,ex);}
   finally{owners.remove(id);sessions.remove(id);}
  }});
 }
}

