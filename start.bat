@echo off
setlocal

if /i "%~1"=="--backend" goto backend
if /i "%~1"=="--frontend" goto frontend

where java >nul 2>&1
if errorlevel 1 (
    echo ERROR: Java 21 or newer is required. Install Java and add it to PATH.
    pause
    exit /b 1
)
where mvn >nul 2>&1
if errorlevel 1 (
    echo ERROR: Maven is required. Install Maven and add it to PATH.
    pause
    exit /b 1
)
where npm >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js and npm are required. Install Node.js and reopen this file.
    pause
    exit /b 1
)

set "SERIAL_ENABLED=true"
if not defined FLIGHTSIMULATION_SERIAL_PORT set "FLIGHTSIMULATION_SERIAL_PORT=COM3"
if not "%~1"=="" set "FLIGHTSIMULATION_SERIAL_PORT=%~1"

echo Close Arduino Serial Monitor and Serial Plotter before starting.
echo Starting ESP32 telemetry on %FLIGHTSIMULATION_SERIAL_PORT%.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8081
echo Stop each server with Ctrl+C in its own window.

start "FlightSimulation Backend" "%ComSpec%" /k call "%~f0" --backend
start "FlightSimulation Frontend" "%ComSpec%" /k call "%~f0" --frontend
exit /b 0

:backend
cd /d "%~dp0backend"
call mvn spring-boot:run
if errorlevel 1 echo Backend failed. Check the error above and whether the serial port is in use.
exit /b

:frontend
cd /d "%~dp0frontend"
if not exist "node_modules\vite\bin\vite.js" (
    call npm install
    if errorlevel 1 (
        echo Frontend dependency installation failed. Check the error above.
        exit /b 1
    )
)
call npm run dev -- --port 5173 --strictPort
exit /b
