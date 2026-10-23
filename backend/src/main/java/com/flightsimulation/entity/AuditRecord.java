package com.flightsimulation.entity;
import jakarta.persistence.*;
import lombok.Getter;
import java.time.Instant;
@Entity @Table(name="audit_records",indexes=@Index(name="idx_audit_created",columnList="created_at")) @Getter
public class AuditRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,updatable=false) private String actor;
 @Column(nullable=false,updatable=false) private String action;
 @Column(nullable=false,updatable=false) private String target;
 @Column(name="created_at",nullable=false,updatable=false) private Instant createdAt;
 protected AuditRecord(){}
 public AuditRecord(String actor,String action,String target){this.actor=actor;this.action=action;this.target=target;this.createdAt=Instant.now();}
}
