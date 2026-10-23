package com.flightsimulation.serial;
import jakarta.validation.Validation;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class SerialTelemetryPacketTest {
 private SerialTelemetryPacket packet(Double[] v){return new SerialTelemetryPacket(v[0],v[1],v[2],v[3],v[4],v[5],v[6]);}
 @Test void rejectsNonFiniteValueInEveryField(){
  try(var factory=Validation.buildDefaultValidatorFactory()){
   var validator=factory.getValidator();
   for(int field=0;field<7;field++)for(double invalid:new double[]{Double.NaN,Double.POSITIVE_INFINITY,Double.NEGATIVE_INFINITY}){
    Double[] values={1.0,2.0,0.0,0.0,0.0,50.0,90.0};values[field]=invalid;
    assertFalse(validator.validate(packet(values)).isEmpty(),"Non-finite field "+field);
   }
  }
 }
 @Test void acceptsFiniteBoundaryValues(){try(var factory=Validation.buildDefaultValidatorFactory()){
  assertTrue(factory.getValidator().validate(new SerialTelemetryPacket(0.0,0.0,-180.0,180.0,360.0,100.0,0.0)).isEmpty());
 }}
 @Test void missingValuesStillFailValidation(){try(var factory=Validation.buildDefaultValidatorFactory()){
  assertFalse(factory.getValidator().validate(new SerialTelemetryPacket(null,0.0,0.0,0.0,0.0,0.0,0.0)).isEmpty());
 }}
}
