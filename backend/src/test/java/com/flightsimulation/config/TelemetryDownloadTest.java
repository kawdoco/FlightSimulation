package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import com.flightsimulation.repository.*;
import com.flightsimulation.entity.*;
import java.util.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.url=jdbc:h2:mem:exporthttp","spring.jpa.hibernate.ddl-auto=create-drop","flightsimulation.serial.enabled=false","spring.jpa.show-sql=false","logging.level.root=WARN"})
@AutoConfigureMockMvc
class TelemetryDownloadTest {
 @Autowired MockMvc mvc;
 @Autowired AircraftRepository aircraft;
 @Autowired FlightRepository flights;
 @Autowired TelemetryRepository telemetry;
 @Test void downloadsEveryRecordAcrossBatchBoundary() throws Exception {
  Aircraft a=new Aircraft();a.setRegistrationNumber("CSV-HTTP");a.setModel("Test");a.setManufacturer("Test");aircraft.save(a);
  Flight f=new Flight();f.setAircraft(a);f.setFlightNumber("=CSV,\"Test\"");f.setDeparture("A");f.setDestination("B");flights.save(f);
  var samples=new ArrayList<Telemetry>();
  for(int i=0;i<501;i++){Telemetry t=new Telemetry();t.setFlight(f);t.setAltitude((double)i);t.setSpeed(20.0);t.setPitch(0.0);t.setRoll(0.0);t.setHeading(0.0);t.setThrottle(50.0);t.setFuel(90.0);samples.add(t);}
  telemetry.saveAllAndFlush(samples);
  try {
   mvc.perform(get("/api/telemetry/"+f.getId()).with(httpBasic("admin","TestOnlyPassword2026!")))
    .andExpect(status().isOk()).andExpect(header().string("X-Result-Limit","200"))
    .andExpect(jsonPath("$.length()").value(200));
   var pending=mvc.perform(get("/api/telemetry/"+f.getId()+"/export").with(httpBasic("admin","TestOnlyPassword2026!")))
    .andExpect(request().asyncStarted()).andReturn();
   pending.getAsyncResult(15000);
   var result=mvc.perform(asyncDispatch(pending)).andExpect(status().isOk())
    .andExpect(header().string("Content-Disposition","attachment; filename=flight-"+f.getId()+"-telemetry.csv"))
    .andExpect(content().contentTypeCompatibleWith("text/csv")).andReturn();
   String csv=result.getResponse().getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
   String[] lines=csv.split("\r\n");assertEquals(506,lines.length);
   assertEquals("Flight Number,\"'=CSV,\"\"Test\"\"\"",lines[1]);
   Set<String> altitudes=new HashSet<>();for(int i=5;i<lines.length;i++)assertTrue(altitudes.add(lines[i].split(",")[1]));
   assertEquals(501,altitudes.size());assertTrue(altitudes.contains("0.0"));assertTrue(altitudes.contains("500.0"));
  } finally {telemetry.deleteAllInBatch(samples);flights.delete(f);aircraft.delete(a);}
 }
 @Test void missingFlightReturns404BeforeStreaming() throws Exception {
  mvc.perform(get("/api/telemetry/999999/export").with(httpBasic("admin","TestOnlyPassword2026!"))).andExpect(status().isNotFound()).andExpect(request().asyncNotStarted());
 }
 @Test void anonymousDownloadIsDenied() throws Exception {mvc.perform(get("/api/telemetry/1/export")).andExpect(status().isUnauthorized());}
}

