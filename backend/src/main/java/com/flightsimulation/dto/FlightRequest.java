package com.flightsimulation.dto;
import com.flightsimulation.entity.Flight;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
public record FlightRequest(
 @NotBlank @Size(max=255) String flightNumber,
 @NotBlank @Size(max=255) String departure,
 @NotBlank @Size(max=255) String destination,
 LocalDateTime scheduledTime
){
 public Flight toEntity(){Flight f=new Flight();f.setFlightNumber(flightNumber.trim());f.setDeparture(departure.trim());f.setDestination(destination.trim());f.setScheduledTime(scheduledTime);return f;}
}
