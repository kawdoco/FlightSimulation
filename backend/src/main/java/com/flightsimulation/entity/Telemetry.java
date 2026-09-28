package com.flightsimulation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

import java.time.LocalDateTime;

@Entity
@Table(name = "telemetry")
public class Telemetry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Altitude is required")
    @PositiveOrZero(message = "Altitude cannot be negative")
    private Double altitude;

    @NotNull(message = "Speed is required")
    @PositiveOrZero(message = "Speed cannot be negative")
    private Double speed;

    @NotNull(message = "Pitch is required")
    private Double pitch;

    @NotNull(message = "Roll is required")
    private Double roll;

    @NotNull(message = "Heading is required")
    @Min(value = 0, message = "Heading must be at least 0")
    @Max(value = 360, message = "Heading must be at most 360")
    private Double heading;

    @NotNull(message = "Throttle is required")
    @Min(value = 0, message = "Throttle must be at least 0")
    @Max(value = 100, message = "Throttle must be at most 100")
    private Double throttle;

    @NotNull(message = "Fuel is required")
    @Min(value = 0, message = "Fuel must be at least 0")
    @Max(value = 100, message = "Fuel must be at most 100")
    private Double fuel;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt;

    @ManyToOne
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    public Telemetry() {
    }

    @PrePersist
    public void prePersist() {
        if (recordedAt == null) {
            recordedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getAltitude() {
        return altitude;
    }

    public void setAltitude(Double altitude) {
        this.altitude = altitude;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public Double getPitch() {
        return pitch;
    }

    public void setPitch(Double pitch) {
        this.pitch = pitch;
    }

    public Double getRoll() {
        return roll;
    }

    public void setRoll(Double roll) {
        this.roll = roll;
    }

    public Double getHeading() {
        return heading;
    }

    public void setHeading(Double heading) {
        this.heading = heading;
    }

    public Double getThrottle() {
        return throttle;
    }

    public void setThrottle(Double throttle) {
        this.throttle = throttle;
    }

    public Double getFuel() {
        return fuel;
    }

    public void setFuel(Double fuel) {
        this.fuel = fuel;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public Flight getFlight() {
        return flight;
    }

    public void setFlight(Flight flight) {
        this.flight = flight;
    }
}