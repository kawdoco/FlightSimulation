package com.flightsimulation.controller;
import com.flightsimulation.entity.AuditRecord;
import com.flightsimulation.repository.AuditRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.*;
@RestController @RequestMapping("/api/operations/audit") @CrossOrigin(origins="${app.frontend.url}", exposedHeaders="X-Request-ID")
public class AuditController {
 private final com.flightsimulation.service.AuditService service;
 public AuditController(com.flightsimulation.service.AuditService service){this.service=service;}
 @GetMapping public com.flightsimulation.dto.PageResponse<AuditRecord> list(@RequestParam(defaultValue="0") int page){
  return com.flightsimulation.dto.PageResponse.from(service.list(page));
 }
}



