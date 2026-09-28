package com.flightsimulation.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

@Entity
@Table(name = "aircraft")
public class Aircraft {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "registration_number", nullable = false, unique = true)
    private String registrationNumber;

    @NotBlank
    @Column(nullable = false)
    private String model;

    private String manufacturer;

    @Column(nullable = false)
    private String status = "AVAILABLE";

    @PositiveOrZero
    @Column(name = "fuel_capacity")
    private Double fuelCapacity;

    @PositiveOrZero
    @Column(name = "max_speed")
    private Double maxSpeed;

    @PositiveOrZero
    @Column(name = "max_altitude")
    private Double maxAltitude;

    public Aircraft() {
    }

    public Aircraft(
            Long id,
            String registrationNumber,
            String model,
            String manufacturer,
            String status,
            Double fuelCapacity,
            Double maxSpeed,
            Double maxAltitude
    ) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.model = model;
        this.manufacturer = manufacturer;
        this.status = status;
        this.fuelCapacity = fuelCapacity;
        this.maxSpeed = maxSpeed;
        this.maxAltitude = maxAltitude;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getFuelCapacity() {
        return fuelCapacity;
    }

    public void setFuelCapacity(Double fuelCapacity) {
        this.fuelCapacity = fuelCapacity;
    }

    public Double getMaxSpeed() {
        return maxSpeed;
    }

    public void setMaxSpeed(Double maxSpeed) {
        this.maxSpeed = maxSpeed;
    }

    public Double getMaxAltitude() {
        return maxAltitude;
    }

    public void setMaxAltitude(Double maxAltitude) {
        this.maxAltitude = maxAltitude;
    }
}