import { advanceBankHeading } from './simulator/bankDynamics';
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
const FlightSimulator = lazy(() => import("./simulator/FlightSimulator.jsx"));
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
  lastReceivedAt,
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

      <Suspense fallback={<p role="status">Loading flight simulator�</p>}> <FlightSimulator
        telemetry={telemetry}
        setTelemetry={setTelemetry}
        controlMode={controlMode}
        setControlMode={setControlMode} lastReceivedAt={lastReceivedAt}
      /></Suspense>
    </>
  );
}

function App() {
  const [keyboardTelemetry, setKeyboardTelemetry] =
    useState(initialTelemetry);
  const [liveTelemetry, setLiveTelemetry] =
    useState(initialTelemetry);
  const [lastReceivedAt, setLastReceivedAt] = useState(null);
  const [hasReceivedTelemetry, setHasReceivedTelemetry] =
    useState(false);
  const [controlMode, setControlMode] = useState("iot");

  const lastHeadingTime = useRef(null);
  const headingState = useRef(0);
  const [simulatorHeading, setSimulatorHeading] = useState(0);

  useEffect(() => {
    let disposed = false;

    connectTelemetryWebSocket((incomingTelemetry) => {
      if (disposed) return;

      const headingTime = performance.now();
      const headingDelta = lastHeadingTime.current === null ? 0.1 : (headingTime - lastHeadingTime.current) / 1000;
      lastHeadingTime.current = headingTime;
      headingState.current = advanceBankHeading(headingState.current,
        Number(incomingTelemetry.speed), Number(incomingTelemetry.roll), headingDelta);
      setSimulatorHeading(headingState.current);
      setLiveTelemetry((current) => ({
        ...current,
        ...incomingTelemetry,
      }));
      setHasReceivedTelemetry(true);
      setLastReceivedAt(Date.now());
    }, telemetryFlightId);

    return () => {
      disposed = true;
      disconnectTelemetryWebSocket();
    };
  }, []);

  const simulatorTelemetry =
    controlMode === "iot"
      ? { ...liveTelemetry, heading: simulatorHeading }
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
                  setControlMode={setControlMode} lastReceivedAt={lastReceivedAt}
                />
              }
            />

            <Route path="/aircraft" element={<AircraftPage />} />
            <Route path="/simulator" element={<Dashboard simulatorPage telemetry={simulatorTelemetry} setTelemetry={setKeyboardTelemetry} controlMode={controlMode} setControlMode={setControlMode} lastReceivedAt={lastReceivedAt} />} />
            <Route path="/flights" element={<FlightPage />} />

            <Route
              path="/telemetry"
              element={
                <TelemetryPage
                  telemetry={liveTelemetry}
                  hasReceivedTelemetry={hasReceivedTelemetry} lastReceivedAt={lastReceivedAt}
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
      hasReceivedTelemetry={hasReceivedTelemetry} lastReceivedAt={lastReceivedAt}
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
