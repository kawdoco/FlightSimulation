import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar.jsx";
import FlightSimulator from "./simulator/FlightSimulator.jsx";

import AircraftPage from "./pages/AircraftPage.jsx";
import FlightPage from "./pages/FlightPage.jsx";
import TelemetryPage from "./pages/TelemetryPage.jsx";
import FlightHistoryPage from "./pages/FlightHistoryPage.jsx";
import TelemetryReportPage from "./pages/TelemetryReportPage.jsx";

import {
  connectTelemetryWebSocket,
  disconnectTelemetryWebSocket,
} from "./services/telemetryService";

import "./App.css";

const initialTelemetry = {
  altitude: 0,
  speed: 0,
  pitch: 0,
  roll: 0,
  heading: 0,
  throttle: 0,
  fuel: 100,
};

function Dashboard({ telemetry, setTelemetry }) {
  return (
    <>
      <div className="topbar">
        <div>
          <h1>Flight Simulation Dashboard</h1>
          <p>Smart Aircraft Simulation &amp; Monitoring System</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Flight Simulator
        </div>
      </div>

      <FlightSimulator
        telemetry={telemetry}
        setTelemetry={setTelemetry}
      />
    </>
  );
}

function App() {
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [liveTelemetry, setLiveTelemetry] = useState(initialTelemetry);
  const [hasReceivedTelemetry, setHasReceivedTelemetry] = useState(false);
  const initialHeading = useRef(null);

  useEffect(() => {
    let disposed = false;

    connectTelemetryWebSocket((incomingTelemetry) => {
      if (disposed) return;

      // Keep the original heading for the telemetry page.
      setLiveTelemetry((current) => ({
        ...current,
        ...incomingTelemetry,
      }));
      setHasReceivedTelemetry(true);

      const incomingHeading = Number(incomingTelemetry.heading);

      if (
        initialHeading.current === null &&
        Number.isFinite(incomingHeading)
      ) {
        initialHeading.current = incomingHeading;
      }

      // The simulator uses heading relative to the first reading.
      setTelemetry((current) => ({
        ...current,
        ...incomingTelemetry,
        heading: Number.isFinite(incomingHeading)
          ? (
              (incomingHeading - (initialHeading.current ?? 0)) % 360 +
              360
            ) % 360
          : current.heading,
      }));
    }, 1);

    return () => {
      disposed = true;
      disconnectTelemetryWebSocket();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  telemetry={telemetry}
                  setTelemetry={setTelemetry}
                />
              }
            />

            <Route path="/aircraft" element={<AircraftPage />} />
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

            <Route path="/history" element={<FlightHistoryPage />} />

            <Route
              path="/reports/:flightId"
              element={<TelemetryReportPage />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;