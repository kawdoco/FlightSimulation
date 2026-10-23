package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.web.socket.*;
import static org.mockito.Mockito.*;
class WebSocketSessionsTest {
 @Test void revokesOnlyMatchingAccount() throws Exception {
  var registry=new WebSocketSessions();var handler=registry.decorate(mock(WebSocketHandler.class));
  var alice=mock(WebSocketSession.class);when(alice.getId()).thenReturn("a");when(alice.isOpen()).thenReturn(true);
  var bob=mock(WebSocketSession.class);when(bob.getId()).thenReturn("b");when(bob.isOpen()).thenReturn(true);
  handler.afterConnectionEstablished(alice);handler.afterConnectionEstablished(bob);
  registry.bind("a","alice");registry.bind("b","bob");registry.revoke(new WebSocketSessions.AccountChanged("alice"));
  verify(alice).close(CloseStatus.POLICY_VIOLATION);verify(bob,never()).close(any(CloseStatus.class));
 }
 @Test void disconnectedSessionIsRemoved() throws Exception {
  var registry=new WebSocketSessions();var handler=registry.decorate(mock(WebSocketHandler.class));
  var session=mock(WebSocketSession.class);when(session.getId()).thenReturn("a");when(session.isOpen()).thenReturn(true);
  handler.afterConnectionEstablished(session);registry.bind("a","alice");handler.afterConnectionClosed(session,CloseStatus.NORMAL);
  registry.revoke(new WebSocketSessions.AccountChanged("alice"));verify(session,never()).close(any(CloseStatus.class));
 }
}
