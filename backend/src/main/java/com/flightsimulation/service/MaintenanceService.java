package com.flightsimulation.service;
import com.flightsimulation.entity.MaintenanceRecord;
import com.flightsimulation.dto.MaintenanceRequest;
import com.flightsimulation.repository.*;
import com.flightsimulation.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import java.time.LocalDateTime;
@Service @Transactional
public class MaintenanceService {
 private final AuditService audit;
 private final MaintenanceRepository records;
 private final AircraftRepository aircraft;
 public MaintenanceService(MaintenanceRepository records, AircraftRepository aircraft, AuditService audit) {
  this.audit=audit; this.records=records; this.aircraft=aircraft;
 }
 @Transactional(readOnly=true)
 public Page<MaintenanceRecord> list(int page) {
  if(page<0) throw new IllegalArgumentException("Page must be nonnegative");
  return records.findAll(PageRequest.of(page,50,Sort.by("createdAt").descending().and(Sort.by("id").descending())));
 }
 public MaintenanceRecord create(MaintenanceRequest request) {
  if(!aircraft.existsById(request.aircraftId())) throw new ResourceNotFoundException("Aircraft not found");
  MaintenanceRecord record=new MaintenanceRecord();
  record.setAircraftId(request.aircraftId()); record.setDescription(request.description().trim());
  record.setStatus("OPEN"); record.setCreatedAt(LocalDateTime.now());
  var saved=records.save(record);
  audit.record(new AuditService.AccountAudit("MAINTENANCE_" + record.getStatus(), "maintenance:" + record.getId()));
  return saved;
 }
 public MaintenanceRecord transition(Long id, String status) {
  MaintenanceRecord record=records.findById(id).orElseThrow(()->new ResourceNotFoundException("Maintenance record not found"));
  boolean allowed=("OPEN".equals(record.getStatus()) && "IN_PROGRESS".equals(status))
    || ("IN_PROGRESS".equals(record.getStatus()) && "COMPLETED".equals(status));
  if(!allowed) throw new IllegalStateException("Allowed transitions: OPEN to IN_PROGRESS to COMPLETED");
  record.setStatus(status);
  if("COMPLETED".equals(status)) record.setCompletedAt(LocalDateTime.now());
  var saved=records.save(record);
  audit.record(new AuditService.AccountAudit("MAINTENANCE_" + record.getStatus(), "maintenance:" + record.getId()));
  return saved;
 }
}

