package com.flightsimulation.repository;
import com.flightsimulation.entity.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AuditRepository extends JpaRepository<AuditRecord,Long>{}
