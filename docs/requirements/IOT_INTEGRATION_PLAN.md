# IoT Integration Plan

## 1. Purpose

The IoT module uses two ESP32 boards: a controller ESP32 with the HW-504 joystick and throttle, and a plane ESP32 with two servos, an MPU6050, and an HC-SR04 ultrasonic sensor. Both boards communicate over the same Wi-Fi network using UDP. The controller sends telemetry to the Java Spring Boot backend over its USB serial connection to the computer.

The backend processes the data and sends real-time updates to the React and Three.js flight simulator.

---

## 2. Main Objectives

- Read aircraft control inputs using physical sensors
- Send joystick commands from the controller ESP32 to the plane ESP32 over local UDP
- Return plane sensor readings to the controller ESP32 over local UDP
- Send controller telemetry to Spring Boot over USB serial
- Update the Three.js aircraft in real time
- Display live telemetry information
- Generate warnings using LEDs and a buzzer
- Store important flight telemetry in the database

---

## 3. Hardware Components

- Two ESP32 DevKit V1 boards (controller and plane)
- Two servo motors for pitch and roll control surfaces
- MPU6050 accelerometer and gyroscope
- HW-504 joystick module
- B10K potentiometer
- HC-SR04 ultrasonic sensor
- Breadboard and jumper wires
- USB data cable from the controller ESP32 to the backend computer
- Separate regulated 5 V supply for the servos, with common ground to the plane ESP32

---

## 4. Sensor and Control Mapping

| Component | System Function |
|---|---|
| HW-504 joystick X/Y | Commands plane roll and pitch servos |
| B10K potentiometer | Commands throttle; speed is derived for the simulation |
| Plane MPU6050 | Measures plane pitch, roll, and gyro heading |
| Plane HC-SR04 | Supplies distance as the simulation altitude value |
| Controller ESP32 | Sends controls over UDP and relays telemetry over USB serial |
| Spring Boot serial listener | Saves telemetry and broadcasts it to WebSocket clients |

---

## 5. System Data Flow

The communication flow is:

1. The controller ESP32 reads the joystick and throttle and sends a UDP control packet.
2. The plane ESP32 moves the two servos and reads the MPU6050 and HC-SR04.
3. The plane ESP32 returns sensor telemetry to the controller ESP32 over UDP.
4. The controller emits one JSON telemetry object per line over USB serial.
5. The Spring Boot serial listener validates the values, saves them through the existing telemetry service, and broadcasts `/topic/telemetry/{flightId}`.
6. The React/Three.js simulator updates the aircraft from the live telemetry.

```text
HW-504 / throttle ──UDP──> Plane ESP32 servos
                                │
                 MPU6050 + HC-SR04 telemetry
                                │ UDP
                                ▼
Controller ESP32 ──USB serial──> Spring Boot
   ↓ WebSocket / STOMP
React + Three.js Simulator
   └── telemetry saved through the existing service
```

---

## 6. Example Telemetry Data

The controller sends one JSON object followed by a newline at 115200 baud:

```json
{
  "altitude": 120.5,
  "speed": 195.0,
  "pitch": 4.5,
  "roll": -2.3,
  "heading": 10.0,
  "throttle": 65,
  "fuel": 100.0
}
```

---

## 7. Backend Integration

The Spring Boot backend reads serial telemetry when enabled and reuses the existing save-and-broadcast flow.

The existing REST endpoint and STOMP destination remain available for other clients:

```text
POST /api/telemetry/{flightId}
```

The backend is responsible for:

- Reading newline-delimited JSON from the configured USB serial port
- Validating required telemetry fields and value ranges
- Saving telemetry using `TelemetryService`
- Broadcasting updates using WebSocket/STOMP
- Creating alerts when values are unsafe
- Saving required telemetry data
- Monitoring the IoT device connection

---

## 8. Frontend Integration

The React frontend will subscribe to the WebSocket telemetry topic.

Topic:

```text
/topic/telemetry/{flightId}
```

The frontend will use the received data to:

- Rotate the 3D aircraft
- Update pitch, roll, heading, and throttle
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

- Both ESP32 boards shall connect to the same 2.4 GHz Wi-Fi network.
- The controller shall send joystick/throttle commands to the plane using UDP.
- The plane shall drive the roll and pitch servos and read its MPU6050 and HC-SR04.
- The plane shall return sensor readings to the controller using UDP.
- The controller shall send newline-delimited JSON to the computer over USB serial at 115200 baud.
- The Spring Boot serial listener shall be configurable and disabled by default.
- The Spring Boot backend shall save and broadcast valid serial telemetry.
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

## 12. Pin map and setup

### Controller ESP32

| Signal | ESP32 pin |
|---|---:|
| HW-504 X | GPIO 34 |
| HW-504 Y | GPIO 35 |
| HW-504 switch | GPIO 27 |
| B10K throttle wiper | GPIO 32 |

Power the joystick and potentiometer from 3.3 V so their analog outputs never exceed the ESP32 ADC input range. Keep the joystick centered while the controller starts; its center is calibrated at boot.
Pressing the joystick switch resets the plane heading estimate to 0 degrees.

### Plane ESP32

| Signal | ESP32 pin |
|---|---:|
| Roll servo signal | GPIO 18 |
| Pitch servo signal | GPIO 19 |
| MPU6050 SDA / SCL | GPIO 21 / GPIO 22 |
| HC-SR04 TRIG / ECHO | GPIO 26 / GPIO 25 |

Use the `Adafruit MPU6050`, `Adafruit Unified Sensor`, and `ESP32Servo` Arduino libraries. Power the servos from a separate regulated 5 V supply and connect that supply's ground to ESP32 ground. Do not power the servos from the ESP32 5 V/3.3 V pins. Use a voltage divider or level shifter on the HC-SR04 ECHO signal before connecting it to GPIO 25.

Enter the same Wi-Fi SSID and password in both sketches. The two ESP32s must be on the same local network, and Wi-Fi client isolation must be disabled. The controller defaults to `SERIAL_DIAGNOSTICS=1` so startup and network failures are visible in Serial Monitor. The backend ignores non-JSON status lines. Set it to `0` only when quiet output is desired. Spring Boot reads the controller ESP32's USB serial port directly; do not open that port in Arduino Serial Monitor while the backend is running. The default settings are COM3, 115200 baud, and flight ID 1. To override them, use:

```text
--flightsimulation.serial.enabled=true
--flightsimulation.serial.port=COMx
--flightsimulation.serial.baud-rate=115200
--flightsimulation.serial.flight-id=1
```

USB serial input is disabled by default so the backend can start without the controller connected. In PowerShell, enable it before starting the backend:

```powershell
$env:SERIAL_ENABLED = "true"
cd backend
.\mvnw.cmd spring-boot:run
```

If startup reports `Could not open ESP32 serial port COM3`, close Arduino Serial Monitor, Serial Plotter, and any other program using that port, then restart the backend. Check the controller's port in Device Manager if it still fails. To run without USB telemetry, set `$env:SERIAL_ENABLED = "false"` before starting the backend.

### Serial Monitor troubleshooting

Altitude is measured relative to the plane's startup ground position. After uploading or resetting the plane, leave it level on the ground with the ultrasonic sensor facing down until `Ground calibrated` appears. The startup median distance is subtracted from subsequent measurements, with a 2 cm ground dead zone. Invalid echoes hold the last altitude; a failed startup calibration leaves altitude at zero until the sensor is fixed and the plane is reset. The backend converts the relative centimeters to feet for the simulator.

1. Stop the backend before opening Serial Monitor. Only one application can own the controller port.
2. Upload `sketch_aug24a/sketch_aug24a.ino` to the controller, select its COM port, and open Serial Monitor at **115200 baud**. Press EN/Reset. With diagnostics enabled, startup and a status message every two seconds should appear even without the plane.
3. `Waiting for 2.4 GHz Wi-Fi` means the controller has not connected. Check the SSID/password and access point band.
4. `Waiting for plane telemetry` means the controller is connected but has not received telemetry. Power the second ESP32 with `plane_esp32.ino` uploaded and check its own Serial Monitor. Both boards need the same reachable network; check whether the hotspot permits UDP broadcast and communication between clients.
5. A plane MPU6050 error stops plane startup and therefore prevents telemetry. Check SDA GPIO21, SCL GPIO22, power and common GND, then reset the plane. The error now repeats so opening Serial Monitor later still reveals it.
6. Once JSON telemetry appears on the controller, close Serial Monitor and start the backend with serial enabled. Ensure the configured flight ID exists; the default local database is recreated on restart, so a previous flight may no longer exist.

The backend waits through serial silence and ignores non-JSON diagnostic lines. These changes require uploading the updated controller sketch and restarting the backend; editing the files alone does not update ESP32 firmware.

Replace `COMx` with the port shown for the controller ESP32 in Windows Device Manager and use an existing flight ID. The Spring Boot process must run on the same computer as the controller's USB cable.

---

## 13. Development Plan

### Phase 1 — Hardware Testing

- Connect the controls and sensors to their respective ESP32 boards
- Test sensors individually
- Confirm stable Serial Monitor readings

### Phase 2 — Separate ESP32 Programs

- Read all sensor values
- Map raw values to aircraft controls
- Create the telemetry JSON packet

### Phase 3 — UDP and USB Serial Communication

- Connect the ESP32 to Wi-Fi
- Send telemetry over USB serial to Spring Boot
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

## 14. Acceptance Criteria

The IoT integration will be considered complete when:

- Both ESP32 boards connect successfully to the same Wi-Fi network
- Joystick movement changes the roll and pitch servo positions
- Plane sensor values arrive at the controller over UDP
- Valid serial telemetry reaches the Spring Boot backend
- The React application receives real-time updates
- The Three.js aircraft responds to physical controls
- Warning indicators operate correctly
- Important telemetry can be stored and retrieved
