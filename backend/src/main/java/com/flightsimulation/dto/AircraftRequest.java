package com.flightsimulation.dto;
import com.flightsimulation.entity.Aircraft;
import jakarta.validation.constraints.*;
public record AircraftRequest(
 @NotBlank @Size(max=255) String registrationNumber,
 @NotBlank @Size(max=255) String model,
 @NotBlank @Size(max=255) String manufacturer,
 @NotBlank @Pattern(regexp="AVAILABLE|IN_FLIGHT|MAINTENANCE|OUT_OF_SERVICE") String status,
 @Positive Double fuelCapacity,@Positive Double maxSpeed,@Positive Double maxAltitude
){
 public Aircraft toEntity(){
  Aircraft a=new Aircraft();a.setRegistrationNumber(registrationNumber.trim());a.setModel(model.trim());a.setManufacturer(manufacturer.trim());
  a.setStatus(status);a.setFuelCapacity(fuelCapacity);a.setMaxSpeed(maxSpeed);a.setMaxAltitude(maxAltitude);return a;
 }
}
