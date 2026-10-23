package com.flightsimulation.dto;
import jakarta.validation.constraints.*;
import com.flightsimulation.entity.Telemetry;
public record TelemetryRequest(
 @NotNull @PositiveOrZero Double altitude,@NotNull @PositiveOrZero Double speed,
 @NotNull Double pitch,@NotNull Double roll,
 @NotNull @DecimalMin("0") @DecimalMax("360") Double heading,
 @NotNull @DecimalMin("0") @DecimalMax("100") Double throttle,
 @NotNull @DecimalMin("0") @DecimalMax("100") Double fuel
){
 @AssertTrue(message="Telemetry values must be finite") public boolean isFinite(){
  for(Double value:new Double[]{altitude,speed,pitch,roll,heading,throttle,fuel})if(value!=null&&!Double.isFinite(value))return false;
  return true;
 }
 public Telemetry toEntity(){Telemetry t=new Telemetry();t.setAltitude(altitude);t.setSpeed(speed);t.setPitch(pitch);t.setRoll(roll);t.setHeading(heading);t.setThrottle(throttle);t.setFuel(fuel);return t;}
}
