package com.flightsimulation.controller;
import com.flightsimulation.service.ReadinessService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.util.Map;
@RestController @RequestMapping("/api/operations") @CrossOrigin(origins="${app.frontend.url}", exposedHeaders="X-Request-ID")
public class OperationsController {
 private final ReadinessService readiness;
 public OperationsController(ReadinessService readiness){this.readiness=readiness;}
 @GetMapping("/readiness") public ResponseEntity<Map<String,String>> readiness(){
  boolean ready=readiness.databaseReady();
  return ResponseEntity.status(ready?HttpStatus.OK:HttpStatus.SERVICE_UNAVAILABLE)
    .cacheControl(CacheControl.noStore()).body(Map.of("status",ready?"UP":"DOWN","database",ready?"UP":"DOWN"));
 }
}

