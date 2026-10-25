package com.flightsimulation.serial;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record SerialTelemetryPacket(
        @NotNull @PositiveOrZero Double altitude,
        @NotNull @PositiveOrZero Double speed,
        @NotNull Double pitch,
        @NotNull Double roll,
        @NotNull @DecimalMin("0.0") @DecimalMax("360.0") Double heading,
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double throttle,
        @NotNull @DecimalMin("0.0") @DecimalMax("100.0") Double fuel,
        Boolean altitudeValid, Boolean imuValid, Boolean commandFresh
) {
    public SerialTelemetryPacket(Double altitude, Double speed, Double pitch, Double roll, Double heading, Double throttle, Double fuel) {
        this(altitude, speed, pitch, roll, heading, throttle, fuel, null, null, null);
    }
    @jakarta.validation.constraints.AssertTrue(message="Telemetry values must be finite")
    public boolean isFinite() {
        for(Double value : new Double[]{altitude,speed,pitch,roll,heading,throttle,fuel})
            if(value != null && !Double.isFinite(value)) return false;
        return true;
    }
}

