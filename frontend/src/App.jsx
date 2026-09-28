import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

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

const Dashboard = ({
  telemetry,
  setTelemetry,
}) => {

  return (

    <>

      <div className="topbar">

        <div>

          <h1>
            Flight Simulation Dashboard
          </h1>

          <p>
            Smart Aircraft Simulation &
            Monitoring System
          </p>

        </div>

        <div className="status">

          <span className="status-dot">
          </span>

          SYSTEM ONLINE

        </div>

      </div>

      <FlightSimulator
        telemetry={telemetry}
        setTelemetry={setTelemetry}
      />

    </>

  );

};

function App() {

  const [
    telemetry,
    setTelemetry,
  ] = useState(initialTelemetry);

  const initialHeading =
    useRef(null);

  useEffect(() => {

    connectTelemetryWebSocket(
      (incomingTelemetry) => {

        const incomingHeading =
          Number(
            incomingTelemetry.heading
          );

        if (
          initialHeading.current === null &&
          Number.isFinite(
            incomingHeading
          )
        ) {

          initialHeading.current =
            incomingHeading;

        }

        const relativeHeading =
          Number.isFinite(
            incomingHeading
          )
            ? (
                incomingHeading -
                (
                  initialHeading.current ??
                  0
                ) +
                360
              ) % 360
            : 0;

        setTelemetry(
          (current) => ({
            ...current,
            ...incomingTelemetry,
            heading: relativeHeading,
          })
        );

      },
      1
    );

    return () => {

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
                  setTelemetry={
                    setTelemetry
                  }
                />
              }
            />

            <Route
              path="/aircraft"
              element={
                <AircraftPage />
              }
            />

            <Route
              path="/flights"
              element={
                <FlightPage />
              }
            />

            <Route
              path="/telemetry"
              element={
                <TelemetryPage />
              }
            />

            <Route
              path="/history"
              element={
                <FlightHistoryPage />
              }
            />

            <Route
              path="/reports/:flightId"
              element={
                <TelemetryReportPage />
              }
            />

          </Routes>

        </main>

      </div>

    </BrowserRouter>

  );

}

export default App;