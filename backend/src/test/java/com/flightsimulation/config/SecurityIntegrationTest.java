package com.flightsimulation.config;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.*;
@SpringBootTest(properties={"APP_ADMIN_PASSWORD=TestOnlyPassword2026!","spring.datasource.url=jdbc:h2:mem:securitytest","spring.jpa.hibernate.ddl-auto=create-drop","flightsimulation.serial.enabled=false"})
@AutoConfigureMockMvc
class SecurityIntegrationTest {
 @Autowired MockMvc mvc;
 @Test void anonymousCannotReadAircraft() throws Exception {mvc.perform(get("/api/aircraft")).andExpect(status().isUnauthorized());}
 @Test void invalidPasswordCannotSignIn() throws Exception {mvc.perform(get("/api/auth/me").with(httpBasic("admin","incorrect"))).andExpect(status().isUnauthorized());}
 @Test void adminCanSignIn() throws Exception {mvc.perform(get("/api/auth/me").with(httpBasic("admin","TestOnlyPassword2026!"))).andExpect(status().isOk()).andExpect(jsonPath("$.username").value("admin")).andExpect(jsonPath("$.roles[0]").value("ROLE_ADMIN")).andExpect(jsonPath("$.roles.length()").value(1));}
 @Test void viewerCannotCreate() throws Exception {mvc.perform(post("/api/aircraft").with(user("reader").roles("VIEWER")).contentType("application/json").content("{}" )).andExpect(status().isForbidden());}
 @Test void operatorCannotDelete() throws Exception {mvc.perform(delete("/api/aircraft/1").with(user("operator").roles("OPERATOR"))).andExpect(status().isForbidden());}
 @Test void viewerCanRead() throws Exception {mvc.perform(get("/api/aircraft").with(user("reader").roles("VIEWER"))).andExpect(status().isOk());}
 @Test void operatorCannotListUsers() throws Exception {mvc.perform(get("/api/users").with(user("operator").roles("OPERATOR"))).andExpect(status().isForbidden());}
 @Test void adminListDoesNotExposePasswords() throws Exception {mvc.perform(get("/api/users").with(user("admin").roles("ADMIN"))).andExpect(status().isOk()).andExpect(jsonPath("$.content[0].passwordHash").doesNotExist());}
 @Test void adminCannotDisableItself() throws Exception {mvc.perform(patch("/api/users/admin").with(user("admin").roles("ADMIN")).contentType("application/json").content("{\"role\":\"VIEWER\",\"enabled\":false}")).andExpect(status().isConflict());}
 @Test void malformedJsonHasSafeMessage() throws Exception {mvc.perform(post("/api/users").with(user("admin").roles("ADMIN")).contentType("application/json").content("{broken"))
  .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Request body must contain valid JSON with the expected field types"));}
 @Test void invalidIdHasConsistentMessage() throws Exception {mvc.perform(get("/api/aircraft/not-a-number").with(user("viewer").roles("VIEWER")))
  .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Invalid value for parameter: id"));}
 @Test void missingAircraftParameterHasConsistentMessage() throws Exception {mvc.perform(post("/api/flights").with(user("operator").roles("OPERATOR")).contentType("application/json").content("{}"))
  .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Required parameter is missing: aircraftId"));}
 @Test void fieldValidationIncludesSummary() throws Exception {mvc.perform(post("/api/users").with(user("admin").roles("ADMIN")).contentType("application/json").content("{}"))
  .andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").value("Request validation failed")).andExpect(jsonPath("$.username").exists());}
 @Test void readinessRequiresAdmin() throws Exception {mvc.perform(get("/api/operations/readiness").with(user("viewer").roles("VIEWER"))).andExpect(status().isForbidden());}
 @Test void readinessReportsHealthyDatabase() throws Exception {mvc.perform(get("/api/operations/readiness").with(user("admin").roles("ADMIN"))).andExpect(status().isOk()).andExpect(jsonPath("$.database").value("UP")).andExpect(header().string("Cache-Control","no-store"));}
 @Test void userListExposesStablePaginationContract() throws Exception {mvc.perform(get("/api/users").with(user("admin").roles("ADMIN"))).andExpect(status().isOk()).andExpect(jsonPath("$.page").value(0)).andExpect(jsonPath("$.size").value(50)).andExpect(jsonPath("$.last").value(true)).andExpect(jsonPath("$.totalElements").isNumber()).andExpect(jsonPath("$.pageable").doesNotExist());}
 @Test void unauthorizedResponseIncludesTraceId() throws Exception {var result=mvc.perform(get("/api/aircraft")).andExpect(status().isUnauthorized()).andReturn();org.junit.jupiter.api.Assertions.assertNotNull(java.util.UUID.fromString(result.getResponse().getHeader("X-Request-ID")));}
 @Test void unauthorizedReturnsSafeJson() throws Exception {mvc.perform(get("/api/aircraft")).andExpect(status().isUnauthorized()).andExpect(content().contentTypeCompatibleWith("application/json")).andExpect(jsonPath("$.error").value("Authentication required. Please sign in.")).andExpect(header().string("Cache-Control","no-store"));}
 @Test void invalidCredentialsReturnSafeJson() throws Exception {mvc.perform(get("/api/auth/me").with(httpBasic("admin","invalid"))).andExpect(status().isUnauthorized()).andExpect(jsonPath("$.error").value("Authentication required. Please sign in."));}
 @Test void forbiddenReturnsSafeJson() throws Exception {mvc.perform(get("/api/users").with(user("viewer").roles("VIEWER"))).andExpect(status().isForbidden()).andExpect(content().contentTypeCompatibleWith("application/json")).andExpect(jsonPath("$.error").value("You do not have permission to perform this action."));}
}
