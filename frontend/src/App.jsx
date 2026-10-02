<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
=======
<<<<<<< HEAD
import {
  useEffect,
  useRef,
  useState,
} from "react";
=======
import { useEffect, useRef, useState } from "react";
>>>>>>> origin/develop
>>>>>>> origin/develop

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

<<<<<<< HEAD
=======
<<<<<<< HEAD
import Sidebar from "./components/Sidebar.jsx";
import FlightSimulator from "./simulator/FlightSimulator.jsx";

import AircraftPage from "./pages/AircraftPage.jsx";
import FlightPage from "./pages/FlightPage.jsx";
import TelemetryPage from "./pages/TelemetryPage.jsx";
import FlightHistoryPage from "./pages/FlightHistoryPage.jsx";
import TelemetryReportPage from "./pages/TelemetryReportPage.jsx";
=======
>>>>>>> origin/develop
import Sidebar from "./components/Sidebar";

import FlightSimulator from "./simulator/FlightSimulator";

import AircraftPage from "./pages/AircraftPage";
import FlightPage from "./pages/FlightPage";
import TelemetryPage from "./pages/TelemetryPage";

<<<<<<< HEAD
=======
>>>>>>> origin/develop
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
=======
<<<<<<< HEAD

  return (

    <>

      <div className="topbar">

        <div>

=======
>>>>>>> origin/develop
  return (
    <>
      <div className="topbar">
        <div>
<<<<<<< HEAD
=======
>>>>>>> origin/develop
>>>>>>> origin/develop
          <h1>
            Flight Simulation Dashboard
          </h1>

          <p>
            Smart Aircraft Simulation &
            Monitoring System
          </p>
<<<<<<< HEAD
=======
<<<<<<< HEAD

        </div>

        <div className="status">

          <span className="status-dot">
          </span>

          SYSTEM ONLINE

        </div>

=======
>>>>>>> origin/develop
        </div>

        <div className="status">
          <span className="status-dot"></span>
          SYSTEM ONLINE
        </div>
<<<<<<< HEAD
=======
>>>>>>> origin/develop
>>>>>>> origin/develop
      </div>

      <FlightSimulator
        telemetry={telemetry}
        setTelemetry={setTelemetry}
      />
<<<<<<< HEAD
=======
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
>>>>>>> origin/develop
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
<<<<<<< HEAD
=======
>>>>>>> origin/develop
>>>>>>> origin/develop
      },
      1
    );

    return () => {
<<<<<<< HEAD
=======
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
>>>>>>> origin/develop
      disconnectTelemetryWebSocket();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />

        <main className="main-content">
          <Routes>
<<<<<<< HEAD
=======
>>>>>>> origin/develop
>>>>>>> origin/develop
            <Route
              path="/"
              element={
                <Dashboard
                  telemetry={telemetry}
<<<<<<< HEAD
                  setTelemetry={setTelemetry}
=======
<<<<<<< HEAD
                  setTelemetry={
                    setTelemetry
                  }
=======
                  setTelemetry={setTelemetry}
>>>>>>> origin/develop
>>>>>>> origin/develop
                />
              }
            />

            <Route
              path="/aircraft"
<<<<<<< HEAD
              element={<AircraftPage />}
=======
<<<<<<< HEAD
              element={
                <AircraftPage />
              }
=======
              element={<AircraftPage />}
>>>>>>> origin/develop
>>>>>>> origin/develop
            />

            <Route
              path="/flights"
<<<<<<< HEAD
              element={<FlightPage />}
=======
<<<<<<< HEAD
              element={
                <FlightPage />
              }
=======
              element={<FlightPage />}
>>>>>>> origin/develop
>>>>>>> origin/develop
            />

            <Route
              path="/telemetry"
<<<<<<< HEAD
=======
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
>>>>>>> origin/develop
              element={<TelemetryPage />}
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
<<<<<<< HEAD
=======
>>>>>>> origin/develop
>>>>>>> origin/develop
}

export default App;