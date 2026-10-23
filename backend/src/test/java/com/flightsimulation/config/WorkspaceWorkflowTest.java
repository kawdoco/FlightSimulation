package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import com.flightsimulation.repository.*;
import com.flightsimulation.entity.Aircraft;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.url=jdbc:h2:mem:workflows","spring.jpa.hibernate.ddl-auto=create-drop","flightsimulation.serial.enabled=false"})
@AutoConfigureMockMvc @Transactional
class WorkspaceWorkflowTest {
 @Autowired MockMvc mvc;
 @Autowired AuditRepository audit;
 @Autowired AircraftRepository aircraft;
 @Autowired MaintenanceRepository maintenance;
 @Test void accountLifecycle() throws Exception {
  mvc.perform(post("/api/users").with(user("admin").roles("ADMIN")).contentType("application/json").content("{\"username\":\"pilot-test\",\"password\":\"OriginalPassword2026!\",\"role\":\"VIEWER\"}")).andExpect(status().isCreated()).andExpect(jsonPath("$.passwordHash").doesNotExist());
  var entry=audit.findAll().stream().filter(r->r.getTarget().equals("pilot-test")).findFirst().orElseThrow();
  assertAudit(entry);
  mvc.perform(get("/api/auth/me").with(httpBasic("pilot-test","OriginalPassword2026!"))).andExpect(status().isOk());
  mvc.perform(post("/api/auth/password").with(httpBasic("pilot-test","OriginalPassword2026!")).contentType("application/json").content("{\"currentPassword\":\"wrong\",\"newPassword\":\"ReplacementPassword2026!\"}")).andExpect(status().isBadRequest());
  mvc.perform(post("/api/auth/password").with(httpBasic("pilot-test","OriginalPassword2026!")).contentType("application/json").content("{\"currentPassword\":\"OriginalPassword2026!\",\"newPassword\":\"ReplacementPassword2026!\"}")).andExpect(status().isOk());
  mvc.perform(get("/api/auth/me").with(httpBasic("pilot-test","OriginalPassword2026!"))).andExpect(status().isUnauthorized());
  mvc.perform(get("/api/auth/me").with(httpBasic("pilot-test","ReplacementPassword2026!"))).andExpect(status().isOk());
  mvc.perform(patch("/api/users/pilot-test").with(user("admin").roles("ADMIN")).contentType("application/json").content("{\"role\":\"OPERATOR\",\"enabled\":false}")).andExpect(status().isOk());
  mvc.perform(get("/api/auth/me").with(httpBasic("pilot-test","ReplacementPassword2026!"))).andExpect(status().isUnauthorized());
 }
 @Test void maintenanceLifecycle() throws Exception {
  Aircraft a=new Aircraft();a.setRegistrationNumber("TEST-M01");a.setModel("Test model");a.setManufacturer("Test manufacturer");a=aircraft.saveAndFlush(a);
  mvc.perform(post("/api/maintenance").with(user("operator").roles("OPERATOR")).contentType("application/json").content("{\"aircraftId\":"+a.getId()+",\"description\":\"Inspect controls\"}")).andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("OPEN"));
  Long id=maintenance.findAll().getFirst().getId();
  long before=audit.count();
  mvc.perform(patch("/api/maintenance/"+id+"/status").with(user("operator").roles("OPERATOR")).contentType("application/json").content("{\"status\":\"COMPLETED\"}")).andExpect(status().isConflict());
  mvc.perform(patch("/api/maintenance/"+id+"/status").with(user("operator").roles("OPERATOR")).contentType("application/json").content("{\"status\":\"IN_PROGRESS\"}")).andExpect(status().isOk());
  mvc.perform(patch("/api/maintenance/"+id+"/status").with(user("operator").roles("OPERATOR")).contentType("application/json").content("{\"status\":\"COMPLETED\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.completedAt").isNotEmpty());
  org.junit.jupiter.api.Assertions.assertEquals(before+2,audit.count());
  var changes=audit.findAll().stream().filter(r->r.getTarget().equals("maintenance:"+id)).toList();
  org.junit.jupiter.api.Assertions.assertEquals(3,changes.size());
  org.junit.jupiter.api.Assertions.assertTrue(changes.stream().allMatch(r->r.getActor().equals("operator")));
  mvc.perform(get("/api/maintenance").with(user("viewer").roles("VIEWER"))).andExpect(status().isOk()).andExpect(jsonPath("$.content[0].status").value("COMPLETED"));
 }
 @Test void clientCannotChooseAircraftIdentifier() throws Exception {
  mvc.perform(post("/api/aircraft").with(user("operator").roles("OPERATOR")).contentType("application/json")
   .content("{\"id\":999999,\"registrationNumber\":\"INPUT-TEST\",\"model\":\"Test\",\"manufacturer\":\"Test\",\"status\":\"AVAILABLE\"}"))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not(999999)));
 }
 private void assertAudit(com.flightsimulation.entity.AuditRecord record){
  org.junit.jupiter.api.Assertions.assertEquals("admin",record.getActor());
  org.junit.jupiter.api.Assertions.assertEquals("USER_CREATED",record.getAction());
  org.junit.jupiter.api.Assertions.assertNotNull(record.getCreatedAt());
 }
 @Test void flightRequestCannotSetServerManagedState() throws Exception {
  Aircraft a=new Aircraft();a.setRegistrationNumber("DTO-FLIGHT");a.setModel("Test");a.setManufacturer("Test");a=aircraft.saveAndFlush(a);
  mvc.perform(post("/api/flights").param("aircraftId",a.getId().toString()).with(user("operator").roles("OPERATOR")).contentType("application/json")
   .content("{\"id\":999999,\"flightNumber\":\" DTO-001 \",\"departure\":\" A \",\"destination\":\" B \",\"status\":\"COMPLETED\",\"startTime\":\"2026-01-01T00:00:00\",\"endTime\":\"2026-01-01T01:00:00\"}"))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(org.hamcrest.Matchers.not(999999)))
   .andExpect(jsonPath("$.flightNumber").value("DTO-001")).andExpect(jsonPath("$.status").value("SCHEDULED"))
   .andExpect(jsonPath("$.startTime").doesNotExist()).andExpect(jsonPath("$.endTime").doesNotExist());
 }
 @Test void aircraftRequestRejectsOversizedText() throws Exception {
  mvc.perform(post("/api/aircraft").with(user("operator").roles("OPERATOR")).contentType("application/json")
   .content("{\"registrationNumber\":\""+"A".repeat(256)+"\",\"model\":\"Test\",\"manufacturer\":\"Test\",\"status\":\"AVAILABLE\"}"))
   .andExpect(status().isBadRequest()).andExpect(jsonPath("$.registrationNumber").exists());
 }
}
