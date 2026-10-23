package com.flightsimulation.dto;
import jakarta.validation.constraints.*;
import com.flightsimulation.entity.Alert;
public record AlertRequest(
 @NotNull @Positive Long aircraftId,@Positive Long flightId,
 @NotBlank @Size(max=255) String type,@NotBlank @Size(max=1000) String message,
 @NotNull @Pattern(regexp="INFO|WARNING|CRITICAL") String severity
){
 public Alert toEntity(){Alert a=new Alert();a.setAircraftId(aircraftId);a.setFlightId(flightId);a.setType(type.trim());a.setMessage(message.trim());a.setSeverity(severity);return a;}
}
