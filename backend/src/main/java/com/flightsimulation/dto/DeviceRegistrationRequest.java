package com.flightsimulation.dto;

import com.flightsimulation.entity.IoTDevice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Registration input excludes database IDs and server-managed device state. */
public record DeviceRegistrationRequest(
        @NotBlank @Size(max = 255) String deviceName,
        @Size(max = 255) String deviceType,
        @NotBlank @Size(max = 255) String deviceIdentifier,
        @Size(max = 255) String ipAddress
) {
    public IoTDevice toEntity() {
        IoTDevice device = new IoTDevice();
        device.setDeviceName(deviceName);
        device.setDeviceType(deviceType);
        device.setDeviceIdentifier(deviceIdentifier);
        device.setIpAddress(ipAddress);
        return device;
    }
}
