package com.flightsimulation.service;
import com.flightsimulation.entity.AuditRecord;
import com.flightsimulation.repository.AuditRepository;
import org.springframework.stereotype.Service;
import org.springframework.context.event.EventListener;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.*;
@Service
public class AuditService {
 public record AccountAudit(String action,String target){}
 private final AuditRepository records;
 public AuditService(AuditRepository records){this.records=records;}
 @Transactional(readOnly=true)
 public org.springframework.data.domain.Page<AuditRecord> list(int page){
  if(page<0)throw new IllegalArgumentException("Page must be nonnegative");
  return records.findAll(org.springframework.data.domain.PageRequest.of(page,50,org.springframework.data.domain.Sort.by("createdAt").descending().and(org.springframework.data.domain.Sort.by("id").descending())));
 }
 @EventListener @Transactional(propagation=Propagation.MANDATORY)
 public void record(AccountAudit event){
  var authentication=SecurityContextHolder.getContext().getAuthentication();
  String actor=authentication==null?"SYSTEM":authentication.getName();
  records.save(new AuditRecord(actor,event.action(),event.target()));
 }
}

