package com.flightsimulation.service;
import com.flightsimulation.repository.UserRepository;
import com.flightsimulation.entity.ApplicationUser;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
@Service
public class AccountService implements UserDetailsService {
 private final org.springframework.context.ApplicationEventPublisher events;
 private final UserRepository users; private final PasswordEncoder encoder;
 public AccountService(UserRepository users,PasswordEncoder encoder,org.springframework.context.ApplicationEventPublisher events){this.users=users;this.encoder=encoder;this.events=events;}
 @Override public UserDetails loadUserByUsername(String name){
  var account=users.findById(name).orElseThrow(()->new UsernameNotFoundException("Invalid credentials"));
  return User.withUsername(account.getUsername()).password(account.getPasswordHash()).roles(account.getRole()).disabled(!account.isEnabled()).build();
 }
 @Transactional public void bootstrap(String password){
  if(users.existsById("admin"))return;
  if(!com.flightsimulation.validation.PasswordPolicy.Validator.valid(password))throw new IllegalArgumentException("APP_ADMIN_PASSWORD must contain at least 12 characters and at most 72 UTF-8 bytes");
  ApplicationUser admin=new ApplicationUser();admin.setUsername("admin");admin.setRole("ADMIN");admin.setPasswordHash(encoder.encode(password));users.save(admin);events.publishEvent(new AuditService.AccountAudit("ADMIN_BOOTSTRAPPED","admin"));
 }
 @Transactional public void changePassword(String name,String current,String replacement){
  if(!com.flightsimulation.validation.PasswordPolicy.Validator.valid(replacement))throw new IllegalArgumentException("Password must contain at least 12 characters and at most 72 UTF-8 bytes");
  var account=users.findById(name).orElseThrow(()->new UsernameNotFoundException("Invalid credentials"));
  if(!encoder.matches(current,account.getPasswordHash()))throw new IllegalArgumentException("Current password is incorrect");
  account.setPasswordHash(encoder.encode(replacement));users.save(account);events.publishEvent(new AuditService.AccountAudit("PASSWORD_CHANGED",name));events.publishEvent(new com.flightsimulation.config.WebSocketSessions.AccountChanged(name));
 }
}




