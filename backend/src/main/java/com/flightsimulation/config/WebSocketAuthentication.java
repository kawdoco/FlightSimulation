package com.flightsimulation.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.*;
import org.springframework.messaging.support.*;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.AccessDeniedException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
@Configuration
public class WebSocketAuthentication implements WebSocketMessageBrokerConfigurer {
 private final WebSocketSessions sessions;
 private final UserDetailsService users; private final PasswordEncoder encoder;
 public WebSocketAuthentication(UserDetailsService users,PasswordEncoder encoder,WebSocketSessions sessions){this.users=users;this.encoder=encoder;this.sessions=sessions;}
 @Override public void configureClientInboundChannel(ChannelRegistration registration) {
  registration.interceptors(new ChannelInterceptor(){
   @Override public Message<?> preSend(Message<?> message,MessageChannel channel){
    StompHeaderAccessor h=MessageHeaderAccessor.getAccessor(message,StompHeaderAccessor.class);
    if(h==null) throw new AccessDeniedException("Invalid frame");
    if(StompCommand.CONNECT.equals(h.getCommand())) {
     try {
      String header=h.getFirstNativeHeader("Authorization");
      if(header==null || !header.startsWith("Basic ")) throw new IllegalArgumentException();
      String[] pair=new String(Base64.getDecoder().decode(header.substring(6)),StandardCharsets.UTF_8).split(":",2);
      var user=users.loadUserByUsername(pair[0]);
      if(pair.length!=2 || !user.isEnabled() || !encoder.matches(pair[1],user.getPassword())) throw new IllegalArgumentException();
      sessions.bind(h.getSessionId(),user.getUsername());
      h.setUser(new UsernamePasswordAuthenticationToken(user.getUsername(),null,user.getAuthorities()));
     } catch(Exception ex){throw new AccessDeniedException("Authentication required");}
    } else if(StompCommand.SUBSCRIBE.equals(h.getCommand())) {
     if(h.getUser()==null || h.getDestination()==null || !h.getDestination().matches("/topic/telemetry/[1-9][0-9]*")) throw new AccessDeniedException("Subscription denied");
    } else if(StompCommand.SEND.equals(h.getCommand())) throw new AccessDeniedException("Client publishing is disabled");
    return message;
   }
  });
 }
}

