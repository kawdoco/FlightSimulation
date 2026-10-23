package com.flightsimulation.dto;
import org.junit.jupiter.api.Test;
import com.flightsimulation.controller.*;
import com.flightsimulation.entity.ApplicationUser;
import tools.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.*;
class CredentialRedactionTest {
 final ObjectMapper mapper=new ObjectMapper();
 @Test void passwordRequestDoesNotExposeCredentials(){var request=new AuthController.PasswordRequest("current-secret","replacement-secret");String json=mapper.writeValueAsString(request);assertFalse(json.contains("current-secret"));assertFalse(json.contains("replacement-secret"));assertFalse(request.toString().contains("secret"));}
 @Test void createRequestDoesNotExposePassword(){var request=new UserManagementController.CreateUser("pilot","private-secret","VIEWER");assertFalse(mapper.writeValueAsString(request).contains("private-secret"));assertFalse(request.toString().contains("private-secret"));}
 @Test void userEntityDoesNotExposeHash(){ApplicationUser user=new ApplicationUser();user.setUsername("pilot");user.setPasswordHash("sensitive-hash");String json=mapper.writeValueAsString(user);assertFalse(json.contains("sensitive-hash"));assertFalse(json.contains("passwordHash"));}
 @Test void writeOnlyPasswordStillDeserializes(){var request=mapper.readValue("{\"currentPassword\":\"original\",\"newPassword\":\"replacement\"}",AuthController.PasswordRequest.class);assertEquals("original",request.currentPassword());assertEquals("replacement",request.newPassword());}
}
