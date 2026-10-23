package com.flightsimulation.controller;
import com.flightsimulation.service.UserManagementService;
import com.flightsimulation.service.UserManagementService.UserView;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
@RestController @RequestMapping("/api/users") @CrossOrigin(origins="${app.frontend.url}", exposedHeaders="X-Request-ID")
public class UserManagementController {
 private final UserManagementService service;
 public UserManagementController(UserManagementService service){this.service=service;}
 public record CreateUser(@NotBlank @Pattern(regexp="[A-Za-z0-9._-]{3,100}") String username,
  @com.fasterxml.jackson.annotation.JsonProperty(access=com.fasterxml.jackson.annotation.JsonProperty.Access.WRITE_ONLY) @com.flightsimulation.validation.PasswordPolicy String password,@NotNull @Pattern(regexp="ADMIN|OPERATOR|VIEWER") String role){ @Override public String toString(){return "CreateUser[credentials=REDACTED]";} }
 public record UpdateUser(@NotNull @Pattern(regexp="ADMIN|OPERATOR|VIEWER") String role,@NotNull Boolean enabled){}
 @GetMapping public com.flightsimulation.dto.PageResponse<UserView> list(@RequestParam(defaultValue="0") int page){return com.flightsimulation.dto.PageResponse.from(service.list(page));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public UserView create(@Valid @RequestBody CreateUser r){return service.create(r.username(),r.password(),r.role());}
 @PatchMapping("/{username}") public UserView update(@PathVariable String username,@Valid @RequestBody UpdateUser r,Authentication actor){return service.update(username,r.role(),r.enabled(),actor.getName());}
}




