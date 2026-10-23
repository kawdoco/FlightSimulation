package com.flightsimulation.service;
import com.flightsimulation.repository.*;
import com.flightsimulation.entity.*;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.io.ByteArrayOutputStream;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class TelemetryExportTest {
 @Test void batchesUseDescendingCursorAndInitialUpperBound() throws Exception {
  var records=mock(TelemetryRepository.class);var flights=mock(FlightRepository.class);
  Flight f=new Flight();f.setFlightNumber("=unsafe,\"text\"");f.setStatus("COMPLETED");
  when(flights.findById(1L)).thenReturn(Optional.of(f));when(records.exportUpperId(1L)).thenReturn(1000L);
  Telemetry t=new Telemetry();t.setId(999L);t.setAltitude(123.0);
  when(records.findByFlightIdAndIdLessThanEqualOrderByIdDesc(eq(1L),eq(1000L),any())).thenReturn(List.of(t));
  when(records.findByFlightIdAndIdLessThanEqualOrderByIdDesc(eq(1L),eq(998L),any())).thenReturn(List.of());
  var body=new TelemetryService(records,flights).exportTelemetryToCsv(1L);
  var output=new ByteArrayOutputStream();body.writeTo(output);
  String csv=output.toString(java.nio.charset.StandardCharsets.UTF_8);
  assertTrue(csv.contains("\"'=unsafe,\"\"text\"\"\""));assertTrue(csv.contains("123.0"));
  verify(records).findByFlightIdAndIdLessThanEqualOrderByIdDesc(eq(1L),eq(998L),argThat(p->p.getPageSize()==500));
  verify(records,never()).findByFlightId(any(),any());
 }
}

