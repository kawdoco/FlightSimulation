package com.flightsimulation.dto;
import org.junit.jupiter.api.Test;
import jakarta.validation.Validation;
import static org.junit.jupiter.api.Assertions.*;
class TelemetryRequestTest {
 @Test void rejectsNonFiniteNumbers(){try(var factory=Validation.buildDefaultValidatorFactory()){
  var validator=factory.getValidator();
  assertFalse(validator.validate(new TelemetryRequest(1.0,2.0,Double.NaN,0.0,0.0,50.0,90.0)).isEmpty());
  assertFalse(validator.validate(new TelemetryRequest(Double.POSITIVE_INFINITY,2.0,0.0,0.0,0.0,50.0,90.0)).isEmpty());
 }}
 @Test void mappingExcludesServerState(){var t=new TelemetryRequest(1.0,2.0,0.0,0.0,0.0,50.0,90.0).toEntity();assertNull(t.getId());assertNull(t.getFlight());assertNull(t.getRecordedAt());assertEquals(1.0,t.getAltitude());}
}
