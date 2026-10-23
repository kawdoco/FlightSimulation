package com.flightsimulation.repository;

import com.flightsimulation.entity.Telemetry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TelemetryRepository
        extends JpaRepository<Telemetry, Long> {

    org.springframework.data.domain.Slice<Telemetry> findByFlightId(Long flightId, org.springframework.data.domain.Pageable pageable);
    @org.springframework.data.jpa.repository.Query("select coalesce(max(t.id),0) from Telemetry t where t.flight.id = :flightId")
    Long exportUpperId(@org.springframework.data.repository.query.Param("flightId") Long flightId);
    List<Telemetry> findByFlightIdAndIdLessThanEqualOrderByIdDesc(Long flightId, Long upperId, org.springframework.data.domain.Pageable pageable);
    interface Summary {
        long getRecordCount();
        Double getAverageAltitude();
        Double getMaxAltitude();
        Double getAverageSpeed();
        Double getMaxSpeed();
        Double getMinimumFuel();
    }
    @org.springframework.data.jpa.repository.Query("select count(t) as recordCount, coalesce(avg(t.altitude),0.0) as averageAltitude, coalesce(max(t.altitude),0.0) as maxAltitude, coalesce(avg(t.speed),0.0) as averageSpeed, coalesce(max(t.speed),0.0) as maxSpeed, coalesce(min(t.fuel),0.0) as minimumFuel from Telemetry t where t.flight.id = :flightId")
    Summary summarize(@org.springframework.data.repository.query.Param("flightId") Long flightId);


}



