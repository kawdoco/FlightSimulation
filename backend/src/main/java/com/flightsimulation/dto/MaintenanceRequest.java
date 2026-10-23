package com.flightsimulation.dto;
import jakarta.validation.constraints.*;
public record MaintenanceRequest(@NotNull @Positive Long aircraftId,
 @NotBlank @Size(max=1000) String description) {}
