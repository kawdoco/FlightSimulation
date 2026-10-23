package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import com.flightsimulation.repository.*;
import com.flightsimulation.service.UserManagementService;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.url=jdbc:h2:mem:auditsecurity","spring.jpa.hibernate.ddl-auto=create-drop","flightsimulation.serial.enabled=false","logging.level.root=WARN","spring.jpa.show-sql=false"})
@AutoConfigureMockMvc
class AuditSecurityTest {
 @Autowired MockMvc mvc;
 @Autowired AuditRepository audit;
 @Autowired UserRepository users;
 @Autowired UserManagementService accounts;
 @Autowired PlatformTransactionManager transactions;
 @Test void anonymousCannotReadAudit()throws Exception{mvc.perform(get("/api/operations/audit")).andExpect(status().isUnauthorized());}
 @Test void viewerAndOperatorCannotReadAudit()throws Exception{for(String role:new String[]{"VIEWER","OPERATOR"})mvc.perform(get("/api/operations/audit").with(user("test").roles(role))).andExpect(status().isForbidden());}
 @Test void adminCanReadAuditButCannotDeleteIt()throws Exception{
  mvc.perform(get("/api/operations/audit").with(user("admin").roles("ADMIN"))).andExpect(status().isOk()).andExpect(jsonPath("$.content").isArray());
  mvc.perform(delete("/api/operations/audit/1").with(user("admin").roles("ADMIN"))).andExpect(status().isNotFound());
 }
 @Test void rollbackRemovesSuccessAuditTogetherWithUser(){
  long before=audit.count();
  new TransactionTemplate(transactions).executeWithoutResult(status->{accounts.create("rollback-test","StrongPassword2026!","VIEWER");assertTrue(users.existsById("rollback-test"));assertEquals(before+1,audit.count());status.setRollbackOnly();});
  assertFalse(users.existsById("rollback-test"));assertEquals(before,audit.count());
 }
 @Test void rejectedAccountChangeDoesNotProduceAudit()throws Exception{
  long before=audit.count();
  mvc.perform(patch("/api/users/admin").with(user("admin").roles("ADMIN")).contentType("application/json").content("{\"role\":\"VIEWER\",\"enabled\":false}")).andExpect(status().isConflict());
  assertEquals(before,audit.count());
 }
}
