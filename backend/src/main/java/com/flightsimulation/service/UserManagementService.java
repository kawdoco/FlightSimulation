package com.flightsimulation.service;
import com.flightsimulation.entity.ApplicationUser;
import com.flightsimulation.repository.UserRepository;
import com.flightsimulation.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.domain.*;
@Service
public class UserManagementService {
 private final org.springframework.context.ApplicationEventPublisher events;
 private final UserRepository users; private final PasswordEncoder encoder;
 public UserManagementService(UserRepository users,PasswordEncoder encoder,org.springframework.context.ApplicationEventPublisher events){this.users=users;this.encoder=encoder;this.events=events;}
 public record UserView(String username,String role,boolean enabled){}
 private UserView view(ApplicationUser u){return new UserView(u.getUsername(),u.getRole(),u.isEnabled());}
 @Transactional(readOnly=true) public Page<UserView> list(int page){
  if(page<0)throw new IllegalArgumentException("Invalid page");
  return users.findAll(PageRequest.of(page,50,Sort.by("username"))).map(this::view);
 }
 @Transactional public UserView create(String username,String password,String role){
  if(users.existsById(username))throw new DuplicateResourceException("Username already exists");
  ApplicationUser u=new ApplicationUser();u.setUsername(username);u.setPasswordHash(encoder.encode(password));u.setRole(role);
  var created=users.save(u);events.publishEvent(new AuditService.AccountAudit("USER_CREATED",username));return view(created);
 }
 @Transactional public UserView update(String username,String role,boolean enabled,String actor){
  if(username.equals(actor)||username.equals("admin"))throw new IllegalStateException("Your own account and bootstrap admin cannot be changed here");
  ApplicationUser u=users.findById(username).orElseThrow(()->new ResourceNotFoundException("User not found"));
  u.setRole(role);u.setEnabled(enabled);var saved=users.save(u);events.publishEvent(new AuditService.AccountAudit("USER_ACCESS_UPDATED",username));events.publishEvent(new com.flightsimulation.config.WebSocketSessions.AccountChanged(username));return view(saved);
 }
}


