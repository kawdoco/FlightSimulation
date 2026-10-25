package com.flightsimulation.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import com.flightsimulation.repository.*;
import com.flightsimulation.entity.*;
import com.flightsimulation.service.TelemetryService;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.url=jdbc:h2:mem:hardwarehttp","spring.jpa.hibernate.ddl-auto=create-drop","flightsimulation.serial.enabled=false","spring.jpa.show-sql=false","logging.level.root=WARN"})
@AutoConfigureMockMvc
class HardwareSessionTest {
 @Autowired MockMvc mvc;
 @Autowired AircraftRepository aircraft;
 @Autowired FlightRepository flights;
 @Autowired TelemetryRepository telemetry;
 @Autowired TelemetryService storage;
 @Test void viewerCanReadButCannotReassignHardware() throws Exception {
  mvc.perform(get("/api/hardware").with(user("viewer").roles("VIEWER"))).andExpect(status().isOk()).andExpect(jsonPath("serialEnabled").value(false));
  mvc.perform(put("/api/hardware/flight").with(user("viewer").roles("VIEWER")).contentType("application/json").content("{\"flightId\":1}")).andExpect(status().isForbidden());
  mvc.perform(get("/api/hardware")).andExpect(status().isUnauthorized());
 }
 @Test void selectingFlightUpdatesSharedMonitoringDestination() throws Exception {
  Aircraft a=new Aircraft();a.setRegistrationNumber("HARDWARE-FLIGHT");a.setModel("Demo");a.setManufacturer("Demo");aircraft.save(a);
  Flight f=new Flight();f.setFlightNumber("HW-001");f.setAircraft(a);f.setDeparture("A");f.setDestination("B");flights.save(f);
  try {
   mvc.perform(put("/api/hardware/flight").with(user("operator").roles("OPERATOR")).contentType("application/json").content("{\"flightId\":"+f.getId()+"}")).andExpect(status().isOk()).andExpect(jsonPath("flightId").value(f.getId()));
   mvc.perform(get("/api/hardware").with(user("viewer").roles("VIEWER"))).andExpect(jsonPath("flightId").value(f.getId()));
   mvc.perform(put("/api/hardware/flight").with(user("operator").roles("OPERATOR")).contentType("application/json").content("{\"flightId\":0}")).andExpect(status().isBadRequest());
   mvc.perform(put("/api/hardware/flight").with(user("operator").roles("OPERATOR")).contentType("application/json").content("{\"flightId\":999999999}")).andExpect(status().isNotFound());
  } finally {flights.delete(f);aircraft.delete(a);}
 }
 @Test void replayAfterCommitDoesNotDuplicateTelemetry() {
  Aircraft a=new Aircraft();a.setRegistrationNumber("HARDWARE-REPLAY");a.setModel("Demo");a.setManufacturer("Demo");aircraft.save(a);
  Flight f=new Flight();f.setFlightNumber("HW-REPLAY");f.setAircraft(a);f.setDeparture("A");f.setDestination("B");flights.save(f);
  String key=UUID.randomUUID().toString();
  try {
   Telemetry t=new Telemetry();t.setIngestKey(key);t.setAltitude(0.0);t.setSpeed(10.0);t.setPitch(0.0);t.setRoll(0.0);t.setHeading(0.0);t.setThrottle(0.0);t.setFuel(100.0);
   var first=storage.saveTelemetry(f.getId(),t);
   Telemetry retry=new Telemetry();retry.setIngestKey(key);
   assertEquals(first.getId(),storage.saveTelemetry(f.getId(),retry).getId());
   assertEquals(1,telemetry.findByFlightId(f.getId(),org.springframework.data.domain.PageRequest.of(0,10)).getNumberOfElements());
  } finally {telemetry.findByIngestKey(key).ifPresent(telemetry::delete);flights.delete(f);aircraft.delete(a);}
 }
}
