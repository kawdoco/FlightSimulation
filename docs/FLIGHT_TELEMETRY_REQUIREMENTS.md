# Flight and Telemetry Requirements

## 1. Purpose
Describe how the system manages flights and displays flight telemetry.

## 2. Flight Management
- A user can create a flight and assign an aircraft.
- A flight has a flight number, departure, destination, start time, and status.
- A user can start and end a flight.
- Completed flights can be viewed in flight history.

## 3. Telemetry Data
The system should record:
- Timestamp
- Flight ID
- Altitude
- Airspeed
- Latitude and longitude
- Pitch, roll, and yaw
- Fuel level

## 4. Data Flow
ESP32 or simulator → Spring Boot backend → database → React dashboard.

## 5. Proposed Database Entities
- Flight: id, flightNumber, aircraftId, departure, destination,
  startTime, endTime, status
- Telemetry: id, flightId, timestamp, altitude, airspeed,
  latitude, longitude, pitch, roll, yaw, fuelLevel

## 6. Proposed API Endpoints
- POST /api/flights — create a flight
- GET /api/flights — list flights
- GET /api/flights/{id} — view one flight
- POST /api/flights/{id}/start — start a flight
- POST /api/flights/{id}/end — end a flight
- GET /api/flights/{id}/telemetry — view telemetry history

## 7. Acceptance Criteria
- A flight can be created and assigned to an aircraft.
- A flight can move from planned to active to completed.
- Telemetry readings are linked to the correct flight.
- The dashboard can display current telemetry.
- A user can view completed flight history.