# IoT Integration Plan

## 1. Purpose

The IoT module provides a physical control system for the FlightSimulation application. It uses an ESP32 and connected sensors to collect control inputs and send them to the Spring Boot backend.

The backend processes the data and sends real-time updates to the React and Three.js flight simulator.

---

## 2. Main Objectives

- Read aircraft control inputs using physical sensors
- Connect the ESP32 to the system through Wi-Fi
- Send sensor readings to the Spring Boot backend
- Update the Three.js aircraft in real time
- Display live telemetry information
- Generate warnings using LEDs and a buzzer
- Store important flight telemetry in the database

---

## 3. Hardware Components

- ESP32 DevKit V1
- MPU6050 accelerometer and gyroscope
- HW-504 joystick module
- B10K potentiometer
- HC-SR04 ultrasonic sensor
- Push buttons
- Green, red, and yellow LEDs
- Active buzzer
- Breadboard and jumper wires
- USB data cable

---

## 4. Sensor and Control Mapping

| Component | System Function |
|---|---|
| MPU6050 | Controls aircraft pitch and roll |
| HW-504 joystick | Controls aircraft direction and rudder |
| B10K potentiometer | Controls throttle and speed |
| HC-SR04 sensor | Detects ground or obstacle distance |
| Push buttons | Controls engine, landing gear, and reset actions |
| LEDs | Shows connection, warning, and system status |
| Buzzer | Produces warning sounds |

---

## 5. System Data Flow

The planned communication flow is:

1. Sensors collect physical control inputs.
2. The ESP32 processes and validates the sensor readings.
3. The ESP32 sends a JSON control packet through Wi-Fi.
4. The Spring Boot backend receives the packet through a REST API.
5. The backend validates and processes the data.
6. WebSocket/STOMP sends the latest data to the React frontend.
7. Three.js updates the aircraft position and movement.
8. Important telemetry records are saved in Supabase PostgreSQL.

```text
Sensors
   ↓
ESP32
   ↓ Wi-Fi / HTTP
Spring Boot REST API
   ↓ WebSocket / STOMP
React + Three.js Simulator
   ↓
Telemetry Display
   ↓
Supabase PostgreSQL
```

---

## 6. Example Telemetry Data

The ESP32 may send data in the following JSON format:

```json
{
  "deviceId": "ESP32-FLIGHT-01",
  "pitch": 4.5,
  "roll": -2.3,
  "yaw": 10.0,
  "throttle": 65,
  "distance": 120.5,
  "engineOn": true,
  "landingGearDown": false,
  "timestamp": 1789034400000
}
```

---

## 7. Backend Integration

The Spring Boot backend will provide endpoints for receiving IoT data.

Planned endpoint:

```text
POST /api/iot/telemetry
```

The backend is responsible for:

- Receiving ESP32 control data
- Validating incoming values
- Processing telemetry information
- Broadcasting updates using WebSocket/STOMP
- Creating alerts when values are unsafe
- Saving required telemetry data
- Monitoring the IoT device connection

---

## 8. Frontend Integration

The React frontend will subscribe to the WebSocket telemetry topic.

Planned topic:

```text
/topic/telemetry
```

The frontend will use the received data to:

- Rotate the 3D aircraft
- Update pitch, roll, yaw, and throttle
- Display sensor and connection status
- Show warning messages
- Update the live telemetry panel

---

## 9. Warning Behaviour

The system should create warnings for situations such as:

- Obstacle or ground distance is too low
- ESP32 connection is lost
- Sensor readings are outside the valid range
- Aircraft speed or control values become unsafe
- Required sensors are not responding

The red LED and buzzer may activate when a critical warning is detected.

---

## 10. Functional Requirements

- The ESP32 shall connect to the configured Wi-Fi network.
- The ESP32 shall read data from connected sensors.
- The ESP32 shall send telemetry data to the backend.
- The backend shall validate incoming telemetry.
- The backend shall broadcast real-time updates.
- The frontend shall update the aircraft using received values.
- The system shall display the ESP32 connection status.
- The system shall generate warnings for unsafe conditions.

---

## 11. Non-Functional Requirements

- Telemetry updates should be delivered with low delay.
- Invalid sensor readings should not crash the system.
- Database credentials must not be stored in ESP32 code.
- Wi-Fi and backend configuration should be easy to update.
- The IoT module should be testable without the complete application.
- The system should recover safely after a connection failure.

---

## 12. Development Plan

### Phase 1 — Hardware Testing

- Connect each sensor to the ESP32
- Test sensors individually
- Confirm stable Serial Monitor readings

### Phase 2 — Combined ESP32 Program

- Read all sensor values
- Map raw values to aircraft controls
- Create the telemetry JSON packet

### Phase 3 — Backend Communication

- Connect the ESP32 to Wi-Fi
- Send telemetry to the REST API
- Validate the received data

### Phase 4 — Real-Time Simulator Integration

- Broadcast telemetry using WebSocket/STOMP
- Subscribe from the React frontend
- Control the Three.js aircraft

### Phase 5 — Testing and Improvements

- Test connection failures
- Test invalid sensor values
- Calibrate the sensors
- Improve response time
- Verify warning behaviour

---

## 13. Acceptance Criteria

The IoT integration will be considered complete when:

- The ESP32 connects successfully to Wi-Fi
- Sensor values appear correctly in the Serial Monitor
- The backend receives valid telemetry packets
- The React application receives real-time updates
- The Three.js aircraft responds to physical controls
- Warning indicators operate correctly
- Important telemetry can be stored and retrieved