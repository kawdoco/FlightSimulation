# ✈️ FlightSimulation

**FlightSimulation** is a full-stack **Enterprise Application Development (EAD)** project that combines an interactive web-based aircraft flight simulation, real-time telemetry monitoring, enterprise management features, and IoT-based physical flight controls.

The system uses **React** and **Three.js** for the interactive 3D flight environment, **Java Spring Boot** for the enterprise backend, **MySQL** for persistent data management, and an **ESP32-based IoT controller** for real-time aircraft control and sensor integration.

---

## 🚀 Project Overview

FlightSimulation is designed to provide an integrated environment where aircraft operations can be simulated, monitored, and managed through a modern enterprise web application.

The platform combines traditional enterprise application functionality with real-time communication, 3D visualization, and IoT hardware integration.

### Main Data Flow

```text
ESP32 IoT Controller
        │
        │ Sensor / Control Data
        ▼
Spring Boot Backend
        │
        │ REST API / WebSocket
        ▼
React Application
        │
        ▼
Three.js 3D Flight Simulator
        │
        ▼
Live Telemetry Dashboard
```

---

## ✨ Key Features

### 🔐 Authentication & Role Management

* Secure user authentication
* JWT-based authorization
* Role-based access control
* Multiple system user roles
* Protected frontend and backend resources

### ✈️ Aircraft Management

* Register aircraft
* Update aircraft information
* View aircraft details
* Manage aircraft operational status
* Store aircraft specifications
* Track aircraft availability
* Monitor maintenance status

### 🛫 Flight Management

* Create and manage flights
* Assign aircraft to flights
* Assign pilots
* Start and terminate flight simulations
* Track flight status
* Store departure and destination information
* Maintain flight history

### 🌍 3D Flight Simulation

The interactive flight simulation environment is developed using **Three.js** with React integration.

Features include:

* Interactive 3D aircraft visualization
* Real-time aircraft movement
* Pitch control
* Roll control
* Yaw control
* Throttle control
* Dynamic camera tracking
* 3D flight environment
* Keyboard flight controls
* IoT flight controller support

### 📡 Live Telemetry Monitoring

Aircraft telemetry is monitored and displayed in real time.

Telemetry information includes:

* Altitude
* Airspeed
* Heading
* Pitch
* Roll
* Throttle
* Fuel level
* Temperature
* Atmospheric pressure
* Flight status

Real-time communication between the backend and frontend is handled using **WebSocket technology**.

### 🔧 Maintenance Management

* Report aircraft faults
* Create maintenance requests
* Track maintenance activities
* Update maintenance status
* View maintenance history
* Monitor aircraft health and availability

### ⚠️ Alert & Warning System

FlightSimulation can generate warnings for abnormal operating conditions, including:

* High temperature
* Low fuel
* Unsafe altitude
* Excessive pitch
* Excessive roll
* Aircraft system faults
* Stall conditions

### 📊 Flight History & Reporting

* Store completed flight records
* View historical telemetry
* Review aircraft usage
* Track flight duration
* Review generated alerts
* Access maintenance records

---

## 🎮 IoT Flight Controller

FlightSimulation integrates an **ESP32-based physical flight controller** with the web application.

The controller collects physical control inputs and sensor readings and sends them to the backend for processing. The processed data is then transmitted to the frontend and reflected in the Three.js aircraft simulation.

### IoT Components

| Component     | Purpose                              |
| ------------- | ------------------------------------ |
| ESP32         | Main IoT microcontroller             |
| MPU6050       | Motion, pitch, and roll detection    |
| Joystick      | Aircraft directional control         |
| BMP280        | Atmospheric pressure and temperature |
| Potentiometer | Throttle control                     |
| Push Buttons  | Additional aircraft controls         |
| LEDs          | Controller and aircraft status       |
| Buzzer        | Warning indication                   |

### IoT Communication Flow

```text
Physical Controls / Sensors
           │
           ▼
         ESP32
           │
           │ IoT Communication
           ▼
   Spring Boot Backend
           │
           ▼
        WebSocket
           │
           ▼
    React Application
           │
           ▼
 Three.js Flight Simulator
```

---

## 🛠️ Technology Stack

### Frontend

* React
* JavaScript
* Three.js
* React Three Fiber
* React Three Drei
* React Router
* Axios
* HTML5
* CSS3

### Backend

* Java
* Spring Boot
* Spring MVC
* Spring Data JPA
* Spring Security
* JWT Authentication
* Spring WebSocket
* Maven

### Database

* MySQL

### IoT

* ESP32
* MPU6050
* BMP280
* Joystick Module
* Potentiometer
* Push Buttons
* LEDs
* Buzzer

### Development Tools

* Git
* GitHub
* Visual Studio Code
* IntelliJ IDEA
* Postman
* Arduino IDE
* MySQL Workbench

---

## 🏗️ System Architecture

```text
┌───────────────────────────┐
│    IoT Flight Controller  │
│          ESP32            │
│                           │
│ Joystick | MPU6050        │
│ BMP280   | Throttle       │
└─────────────┬─────────────┘
              │
              │ IoT Data
              ▼
┌───────────────────────────┐
│    Spring Boot Backend    │
│                           │
│ REST API                  │
│ WebSocket                 │
│ Authentication            │
│ Business Logic            │
│ IoT Data Processing       │
└─────────────┬─────────────┘
              │
       REST / WebSocket
              │
              ▼
┌───────────────────────────┐
│      React Frontend       │
│                           │
│ Dashboard                 │
│ Aircraft Management       │
│ Flight Management         │
│ Telemetry                 │
│ Maintenance               │
│ Alerts                    │
└─────────────┬─────────────┘
              │
              ▼
┌───────────────────────────┐
│ Three.js Flight Simulator │
│                           │
│ 3D Aircraft               │
│ Flight Controls           │
│ Environment               │
│ Camera System             │
└───────────────────────────┘
              │
              ▼
        MySQL Database
```

---

## 📁 Project Structure

```text
FlightSimulation/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── simulator/
│   │   ├── services/
│   │   └── assets/
│   └── package.json
│
├── backend/
│   ├── src/main/java/
│   │   └── com/flightsimulation/
│   │       ├── controller/
│   │       ├── service/
│   │       ├── repository/
│   │       ├── entity/
│   │       ├── dto/
│   │       ├── security/
│   │       ├── config/
│   │       └── websocket/
│   └── pom.xml
│
├── iot/
│   ├── esp32_controller/
│   └── sensors/
│
├── database/
│   └── schema.sql
│
├── docs/
│   ├── architecture/
│   ├── diagrams/
│   └── api/
│
└── README.md
```

---

## 🗄️ Core Data Model

The application is structured around several interconnected enterprise entities:

```text
User
 │
 └── Flight
      │
      ├── Aircraft
      ├── Telemetry
      └── Alert

Aircraft
 │
 └── Maintenance
```

### User

Stores authenticated users and authorization information.

### Aircraft

Maintains aircraft information, technical specifications, and operational status.

### Flight

Stores individual flight sessions and simulation information.

### Telemetry

Maintains real-time and historical aircraft telemetry data.

### Maintenance

Tracks aircraft faults, maintenance activities, and service history.

### Alert

Stores operational and safety warnings generated during flight sessions.

---

## 👥 Development Collaboration

FlightSimulation is collaboratively developed by a **five-member undergraduate engineering team** using a structured Git-based development process.

Development is organized around independent feature branches, allowing different parts of the application to be implemented in parallel while maintaining a stable shared codebase. Changes are integrated through pull requests, code reviews, and controlled merges to support code quality, consistency, and effective team collaboration.

---

## 🌿 Development Workflow

```text
main
 │
 └── develop
      │
      ├── feature/simulator
      ├── feature/aircraft-management
      ├── feature/flight-telemetry
      ├── feature/maintenance-alerts
      └── feature/iot-integration
```

