package com.flightsimulation.controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import java.util.Map;
@RestController @RequestMapping("/api/auth") @CrossOrigin(origins="${app.frontend.url}", exposedHeaders="X-Request-ID")
public class AuthController {
 private final com.flightsimulation.service.AccountService accounts;
 public AuthController(com.flightsimulation.service.AccountService accounts){this.accounts=accounts;}
 public record PasswordRequest(@com.fasterxml.jackson.annotation.JsonProperty(access=com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY) @jakarta.validation.constraints.NotBlank String currentPassword,
  @com.fasterxml.jackson.annotation.JsonProperty(access=com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY) @com.flightsimulation.validation.PasswordPolicy String newPassword){
  @Override public String toString(){return "PasswordRequest[credentials=REDACTED]";}
 }
 @PostMapping("/password") public Map<String,String> changePassword(Authentication user,@jakarta.validation.Valid @RequestBody PasswordRequest request){
  accounts.changePassword(user.getName(),request.currentPassword(),request.newPassword());
  return Map.of("message","Password changed. Sign in again.");
 }
 @GetMapping("/me") public Map<String,Object> me(Authentication user) {
  return Map.of("username",user.getName(),"roles",user.getAuthorities().stream().map(org.springframework.security.core.GrantedAuthority::getAuthority).filter(role -> java.util.Set.of("ROLE_ADMIN", "ROLE_OPERATOR", "ROLE_VIEWER").contains(role)).toList());
 }
}





