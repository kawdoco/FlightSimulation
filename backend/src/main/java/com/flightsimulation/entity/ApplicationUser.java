package com.flightsimulation.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity @Table(name="application_users") @Getter @Setter @NoArgsConstructor
public class ApplicationUser {
 @Id @Column(length=100) private String username;
 @com.fasterxml.jackson.annotation.JsonIgnore
 @Column(nullable=false) private String passwordHash;
 @Column(nullable=false) private String role;
 @Column(nullable=false, columnDefinition="boolean default true") private boolean enabled=true;
 @Version private Long version;
}


