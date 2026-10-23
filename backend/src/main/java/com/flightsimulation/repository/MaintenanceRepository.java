package com.flightsimulation.repository;
import com.flightsimulation.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
public interface MaintenanceRepository extends JpaRepository<MaintenanceRecord,Long> {}
