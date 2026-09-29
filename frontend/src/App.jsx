<<<<<<< HEAD
import {
  useEffect,
  useRef,
  useState,
} from "react";
=======
import { useEffect, useRef, useState } from "react";
>>>>>>> origin/develop

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

<<<<<<< HEAD
import Sidebar from "./components/Sidebar.jsx";
import FlightSimulator from "./simulator/FlightSimulator.jsx";

import AircraftPage from "./pages/AircraftPage.jsx";
import FlightPage from "./pages/FlightPage.jsx";
import TelemetryPage from "./pages/TelemetryPage.jsx";
import FlightHistoryPage from "./pages/FlightHistoryPage.jsx";
import TelemetryReportPage from "./pages/TelemetryReportPage.jsx";
=======
import Sidebar from "./components/Sidebar";

import FlightSimulator from "./simulator/FlightSimulator";

import AircraftPage from "./pages/AircraftPage";
import FlightPage from "./pages/FlightPage";
import TelemetryPage from "./pages/TelemetryPage";

>>>>>>> origin/develop
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
<<<<<<< HEAD

  return (

    <>

      <div className="topbar">

        <div>

=======
  return (
    <>
      <div className="topbar">
        <div>
>>>>>>> origin/develop
          <h1>
            Flight Simulation Dashboard
          </h1>

          <p>
            Smart Aircraft Simulation &
            Monitoring System
          </p>
<<<<<<< HEAD

        </div>

        <div className="status">

          <span className="status-dot">
          </span>

          SYSTEM ONLINE

        </div>

=======
        </div>

        <div className="status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
>>>>>>> origin/develop
      </div>

      <FlightSimulator
        telemetry={telemetry}
        setTelemetry={setTelemetry}
      />
<<<<<<< HEAD

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

=======
    </>
  );
};

function App() {
  const [telemetry, setTelemetry] =
    useState(initialTelemetry);
  const initialHeading = useRef(null);

  useEffect(() => {
    connectTelemetryWebSocket(
      (incomingTelemetry) => {
        const incomingHeading = Number(incomingTelemetry.heading);

        if (
          initialHeading.current === null &&
          Number.isFinite(incomingHeading)
        ) {
          initialHeading.current = incomingHeading;
        }

        const relativeHeading = Number.isFinite(incomingHeading)
          ? (incomingHeading - (initialHeading.current ?? 0) + 360) % 360
          : 0;

        setTelemetry((current) => ({
          ...current,
          ...incomingTelemetry,
          heading: relativeHeading,
        }));
>>>>>>> origin/develop
      },
      1
    );

    return () => {
<<<<<<< HEAD

      disconnectTelemetryWebSocket();

    };

  }, []);

  return (

    <BrowserRouter>

      <div className="app">

        <Sidebar />

        <main className="main-content">

          <Routes>

=======
      disconnectTelemetryWebSocket();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />

        <main className="main-content">
          <Routes>
>>>>>>> origin/develop
            <Route
              path="/"
              element={
                <Dashboard
                  telemetry={telemetry}
<<<<<<< HEAD
                  setTelemetry={
                    setTelemetry
                  }
=======
                  setTelemetry={setTelemetry}
>>>>>>> origin/develop
                />
              }
            />

            <Route
              path="/aircraft"
<<<<<<< HEAD
              element={
                <AircraftPage />
              }
=======
              element={<AircraftPage />}
>>>>>>> origin/develop
            />

            <Route
              path="/flights"
<<<<<<< HEAD
              element={
                <FlightPage />
              }
=======
              element={<FlightPage />}
>>>>>>> origin/develop
            />

            <Route
              path="/telemetry"
<<<<<<< HEAD
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

=======
              element={<TelemetryPage />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
>>>>>>> origin/develop
}

export default App;