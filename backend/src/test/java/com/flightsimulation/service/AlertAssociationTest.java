package com.flightsimulation.service;
import com.flightsimulation.repository.*;
import com.flightsimulation.entity.*;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class AlertAssociationTest {
 @Test void rejectsFlightFromAnotherAircraft(){
  var alerts=mock(AlertRepository.class);var aircraft=mock(AircraftRepository.class);var flights=mock(FlightRepository.class);
  when(aircraft.existsById(1L)).thenReturn(true);Aircraft other=new Aircraft();other.setId(2L);Flight flight=new Flight();flight.setAircraft(other);when(flights.findById(10L)).thenReturn(Optional.of(flight));
  Alert alert=new Alert();alert.setAircraftId(1L);alert.setFlightId(10L);alert.setSeverity("WARNING");
  assertThrows(IllegalArgumentException.class,()->new AlertService(alerts,aircraft,flights).createAlert(alert));verify(alerts,never()).save(any());
 }
}
