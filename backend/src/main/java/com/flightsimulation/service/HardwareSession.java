package com.flightsimulation.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** One physical controller belongs to one flight at a time. */
@Service
public class HardwareSession {
    private volatile long flightId;
    private volatile String port = "disconnected";
    private volatile java.time.Instant lastPacketAt;
    private final boolean enabled;
    public HardwareSession(@Value("${flightsimulation.serial.flight-id:1}") long flightId,
                           @Value("${flightsimulation.serial.enabled:false}") boolean enabled) {
        this.flightId = flightId;
        this.enabled = enabled;
    }
    public long flightId() { return flightId; }
    public void selectFlight(long id) { flightId = id; }
    public void connected(String name) { port = name; }
    public void disconnected() { port = "disconnected"; }
    public void received() { lastPacketAt = java.time.Instant.now(); }
    public java.util.Map<String, Object> status() {
        var result = new java.util.LinkedHashMap<String, Object>();
        result.put("flightId", flightId);
        result.put("serialEnabled", enabled);
        result.put("port", port);
        result.put("lastPacketAt", lastPacketAt);
        return result;
    }
}
