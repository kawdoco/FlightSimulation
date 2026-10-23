package com.flightsimulation.service;
import com.flightsimulation.entity.MaintenanceRecord;
import com.flightsimulation.dto.MaintenanceRequest;
import com.flightsimulation.repository.*;
import com.flightsimulation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class MaintenanceServiceTest {
 final MaintenanceRepository records=mock(MaintenanceRepository.class);
 final AircraftRepository aircraft=mock(AircraftRepository.class);
 final MaintenanceService service=new MaintenanceService(records,aircraft,mock(AuditService.class));
 @Test void rejectsUnknownAircraft() {
  assertThrows(ResourceNotFoundException.class,()->service.create(new MaintenanceRequest(9L,"Inspect engine")));
  verifyNoInteractions(records);
 }
 @Test void rejectsSkippingWork() {
  MaintenanceRecord record=new MaintenanceRecord();record.setStatus("OPEN");
  when(records.findById(1L)).thenReturn(Optional.of(record));
  assertThrows(IllegalStateException.class,()->service.transition(1L,"COMPLETED"));
  verify(records,never()).save(any());
 }
 @Test void completesWorkWithTimestamp() {
  MaintenanceRecord record=new MaintenanceRecord();record.setStatus("IN_PROGRESS");
  when(records.findById(1L)).thenReturn(Optional.of(record));
  service.transition(1L,"COMPLETED");
  assertEquals("COMPLETED",record.getStatus()); assertNotNull(record.getCompletedAt());
  verify(records).save(record);
 }
}

