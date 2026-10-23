package com.flightsimulation.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
@Entity @Table(name="maintenance_records") @Getter @Setter @NoArgsConstructor
public class MaintenanceRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Version private Long version;
 @Column(nullable=false) private Long aircraftId;
 @Column(nullable=false,length=1000) private String description;
 @Column(nullable=false) private String status;
 @Column(nullable=false) private LocalDateTime createdAt;
 private LocalDateTime completedAt;
}
