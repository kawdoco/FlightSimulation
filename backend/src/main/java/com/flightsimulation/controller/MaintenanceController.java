package com.flightsimulation.controller;
import com.flightsimulation.dto.MaintenanceRequest;
import com.flightsimulation.entity.MaintenanceRecord;
import com.flightsimulation.service.MaintenanceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/api/maintenance") @CrossOrigin(origins="${app.frontend.url}", exposedHeaders="X-Request-ID")
public class MaintenanceController {
 private final MaintenanceService service;
 public MaintenanceController(MaintenanceService service) {this.service=service;}
 @GetMapping public com.flightsimulation.dto.PageResponse<MaintenanceRecord> list(@RequestParam(defaultValue="0") int page) {return com.flightsimulation.dto.PageResponse.from(service.list(page));}
 @PostMapping @ResponseStatus(HttpStatus.CREATED)
 public MaintenanceRecord create(@Valid @RequestBody MaintenanceRequest request) {return service.create(request);}
 public record StatusRequest(@NotBlank String status) {}
 @PatchMapping("/{id}/status") public MaintenanceRecord update(@PathVariable Long id,@Valid @RequestBody StatusRequest request) {
  return service.transition(id,request.status());
 }
}


