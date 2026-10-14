import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import FlightSimulator from "./simulator/FlightSimulator.jsx";
import AircraftPage from "./pages/AircraftPage.jsx";
import FlightPage from "./pages/FlightPage.jsx";
import TelemetryPage from "./pages/TelemetryPage.jsx";
import FlightHistoryPage from "./pages/FlightHistoryPage.jsx";
import TelemetryReportPage from "./pages/TelemetryReportPage.jsx";
import MaintenancePage from "./pages/MaintenancePage.jsx";
import IoTDevicesPage from "./pages/IoTDevicesPage.jsx";

import {
  connectTelemetryWebSocket,
  disconnectTelemetryWebSocket,
} from "./services/telemetryService";

import Icon from "./components/Icon";
import "./App.css";
import "./professional.css";
import WorkspaceBreadcrumb from "./components/WorkspaceBreadcrumb";

const configuredFlightId = Number(import.meta.env.VITE_TELEMETRY_FLIGHT_ID ?? 1);
const telemetryFlightId = Number.isSafeInteger(configuredFlightId) && configuredFlightId > 0
  ? configuredFlightId
  : 1;

const initialTelemetry = {
  altitude: 0,
  speed: 0,
  pitch: 0,
  roll: 0,
  heading: 0,
  throttle: 0,
  fuel: 100,
};

function Dashboard({
  telemetry,
  setTelemetry,
  controlMode,
  setControlMode,
  simulatorPage = false,
}) {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>{simulatorPage ? "Flight Simulator" : "Flight Simulation Dashboard"}</h1>
          <p>Control your aircraft. Monitor every movement.</p>
        </div>

        <div className="status">
          <Icon name={controlMode === "keyboard" ? "keyboard" : "chip"} size={16} />
          {controlMode === "keyboard" ? "Keyboard mode" : "IoT / ESP32 mode"}
        </div>
      </div>

      <FlightSimulator
        telemetry={telemetry}
        setTelemetry={setTelemetry}
        controlMode={controlMode}
        setControlMode={setControlMode}
      />
    </>
  );
}

function App() {
  const [keyboardTelemetry, setKeyboardTelemetry] =
    useState(initialTelemetry);
  const [liveTelemetry, setLiveTelemetry] =
    useState(initialTelemetry);
  const [hasReceivedTelemetry, setHasReceivedTelemetry] =
    useState(false);
  const [controlMode, setControlMode] = useState("keyboard");

  const initialHeading = useRef(null);

  useEffect(() => {
    let disposed = false;

    connectTelemetryWebSocket((incomingTelemetry) => {
      if (disposed) return;

      const heading = Number(incomingTelemetry.heading);

      if (
        initialHeading.current === null &&
        Number.isFinite(heading)
      ) {
        initialHeading.current = heading;
      }

      setLiveTelemetry((current) => ({
        ...current,
        ...incomingTelemetry,
      }));
      setHasReceivedTelemetry(true);
    }, telemetryFlightId);

    return () => {
      disposed = true;
      disconnectTelemetryWebSocket();
    };
  }, []);

  const incomingHeading = Number(liveTelemetry.heading);
  const relativeHeading = Number.isFinite(incomingHeading)
    ? (
        (incomingHeading - (initialHeading.current ?? 0)) % 360 +
        360
      ) % 360
    : 0;

  const simulatorTelemetry =
    controlMode === "iot"
      ? { ...liveTelemetry, heading: relativeHeading }
      : keyboardTelemetry;

  return (
    <BrowserRouter>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="app">
        <Sidebar />

        <main id="main-content" className="main-content" tabIndex={-1}>
          <WorkspaceBreadcrumb />
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  telemetry={simulatorTelemetry}
                  setTelemetry={setKeyboardTelemetry}
                  controlMode={controlMode}
                  setControlMode={setControlMode}
                />
              }
            />

            <Route path="/aircraft" element={<AircraftPage />} />
            <Route path="/simulator" element={<Dashboard simulatorPage telemetry={simulatorTelemetry} setTelemetry={setKeyboardTelemetry} controlMode={controlMode} setControlMode={setControlMode} />} />
            <Route path="/flights" element={<FlightPage />} />

            <Route
              path="/telemetry"
              element={
                <TelemetryPage
                  telemetry={liveTelemetry}
                  hasReceivedTelemetry={hasReceivedTelemetry}
                />
              }
            />
           
            <Route
              path="/history"
              element={<FlightHistoryPage />}
            />

            <Route
              path="/reports/:flightId"
              element={<TelemetryReportPage />}
            />
            <Route
  path="/maintenance"
  element={<MaintenancePage />}
/>

<Route
  path="/iot-devices"
  element={
    <IoTDevicesPage
      telemetry={liveTelemetry}
      hasReceivedTelemetry={hasReceivedTelemetry}
    />
  }
/>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
