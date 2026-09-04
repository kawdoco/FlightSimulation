# FlightSimulation — System Architecture

## 1. Overview

FlightSimulation is a full-stack Enterprise Application Development (EAD) project that combines an interactive aircraft flight simulation, real-time telemetry monitoring, enterprise management features, and an ESP32-based physical flight controller.

The system follows a layered and modular architecture to support maintainability, scalability, team collaboration, and separation of concerns.

---

## 2. Technology Stack

### Frontend
- React
- Vite
- Three.js
- JavaScript
- STOMP/WebSocket

### Backend
- Java
- Spring Boot
- Spring MVC
- Spring Data JPA
- Spring Security
- WebSocket/STOMP

### Database
- PostgreSQL
- Supabase

### IoT
- ESP32 DevKit
- MPU6050
- HW-504 Joystick
- B10K Potentiometer
- HC-SR04 Ultrasonic Sensor
- Push Buttons
- LEDs
- Buzzer

### Development & Collaboration
- Git
- GitHub
- GitHub Issues
- Feature Branches
- Pull Requests
- Sprint-based development

---

## 3. High-Level System Architecture

The application consists of four major layers:

1. IoT Flight Controller
2. Spring Boot Backend
3. React/Three.js Frontend
4. Supabase PostgreSQL Database

Data flow:

ESP32 Controller  
→ Spring Boot REST API  
→ WebSocket/STOMP  
→ React + Three.js Flight Simulator  
→ Telemetry Processing  
→ Spring Boot Backend  
→ Supabase PostgreSQL

---

## 4. Frontend Architecture

The frontend is implemented using React and Three.js.

Main responsibilities include:

- Interactive 3D aircraft simulation
- Aircraft visualization
- Real-time flight telemetry display
- Flight control interface
- Aircraft management interface
- Flight management interface
- Maintenance and alert monitoring
- IoT device monitoring

Three.js is responsible for rendering and controlling the 3D aircraft environment.

React provides the application UI, component structure, state management, and communication with backend services.

---

## 5. Backend Architecture

The backend follows a layered Spring Boot architecture.

### Controller Layer
Handles HTTP requests and exposes REST API endpoints.

### Service Layer
Contains application and business logic.

### Repository Layer
Provides database access using Spring Data JPA.

### Model/Entity Layer
Represents persistent application data.

### Configuration Layer
Contains application-level configuration including security, CORS, and WebSocket configuration.

Typical request flow:

Client  
→ Controller  
→ Service  
→ Repository  
→ PostgreSQL Database

---

## 6. Real-Time Communication Architecture

WebSocket with STOMP is used for real-time communication between the Spring Boot backend and the React frontend.

This allows flight control and telemetry information to be transferred without repeatedly polling the backend.

Example flow:

ESP32  
→ HTTP control packet  
→ Spring Boot  
→ STOMP topic  
→ React Flight Simulator

---

## 7. IoT Integration Architecture

The ESP32 acts as the physical flight controller.

### Control Mapping

- MPU6050 → Pitch and Roll
- HW-504 Joystick → Heading / Rudder
- B10K Potentiometer → Throttle
- HC-SR04 → Ground / Obstacle Proximity
- Push Buttons → Engine, Landing Gear, Reset
- LEDs → System Status
- Buzzer → Warning Indication

The ESP32 does not communicate directly with the database.

Instead:

ESP32  
→ Spring Boot Backend  
→ React/Three.js Simulator  
→ Telemetry Backend  
→ Supabase

This keeps database access and enterprise business logic inside the backend.

---

## 8. Database Architecture

Supabase PostgreSQL is used as the persistent database.

Spring Data JPA provides the persistence layer between Spring Boot and PostgreSQL.

Core application data includes:

- Aircraft
- Flights
- Telemetry
- IoT Devices
- Maintenance Records
- Alerts
- Users and Roles

---

## 9. Git Branching Strategy

The project follows a feature-branch workflow.

### Main Branch

`main`

Contains stable project releases.

### Development Branch

`develop`

Acts as the integration branch for completed features.

### Feature Branches

Each task or feature is developed in a dedicated branch.

Examples:

- `feature/architecture-setup`
- `feature/aircraft-management`
- `feature/flight-telemetry`
- `feature/maintenance-alerts`
- `feature/iot-integration`

Development workflow:

Issue  
→ Feature Branch  
→ Development  
→ Commit  
→ Pull Request  
→ Review  
→ Merge into `develop`

After a sprint/release is validated, `develop` can be merged into `main`.

---

## 10. Team Collaboration

The FlightSimulation project is developed by a five-member team using parallel feature development.

GitHub Issues are used to define and assign development tasks.

Feature branches isolate each member's work, while Pull Requests provide a controlled integration and review process.

The team leader coordinates architecture, integration, reviews, and final merges.

---

## 11. Architectural Goals

The architecture is designed to provide:

- Separation of concerns
- Modular development
- Real-time communication
- IoT integration
- Persistent data management
- Team-based parallel development
- Maintainability
- Scalability
- Controlled code integration