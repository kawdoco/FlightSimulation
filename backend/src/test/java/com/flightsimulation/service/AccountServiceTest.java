package com.flightsimulation.service;
import org.junit.jupiter.api.Test;
import com.flightsimulation.entity.ApplicationUser;
import com.flightsimulation.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class AccountServiceTest {
 final UserRepository users=mock(UserRepository.class);
 final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
 final AccountService service=new AccountService(users,encoder,mock(org.springframework.context.ApplicationEventPublisher.class));
 @Test void restartDoesNotResetPassword(){when(users.existsById("admin")).thenReturn(true);service.bootstrap("");verify(users,never()).save(any());}
 @Test void bootstrapRejectsWeakPassword(){assertThrows(IllegalArgumentException.class,()->service.bootstrap("short"));verify(users,never()).save(any());}
 @Test void wrongCurrentPasswordCannotChangeAccount(){
  ApplicationUser user=new ApplicationUser();user.setPasswordHash(encoder.encode("OriginalPassword123"));
  when(users.findById("admin")).thenReturn(Optional.of(user));
  assertThrows(IllegalArgumentException.class,()->service.changePassword("admin","wrong","ReplacementPassword123"));verify(users,never()).save(any());
 }
 @Test void passwordChangeStoresHash(){
  ApplicationUser user=new ApplicationUser();user.setPasswordHash(encoder.encode("OriginalPassword123"));
  when(users.findById("admin")).thenReturn(Optional.of(user));
  service.changePassword("admin","OriginalPassword123","ReplacementPassword123");
  assertTrue(encoder.matches("ReplacementPassword123",user.getPasswordHash()));verify(users).save(user);
 }
}

