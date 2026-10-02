import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { useEffect, useRef } from "react";

import Aircraft from "./Aircraft";
import Runway from "./Runway";
import ChaseCamera from "./ChaseCamera";

import TelemetryPanel from "../components/TelemetryPanel";
import FlightHUD from "../components/FlightHUD";

const FlightScene = ({ telemetry }) => {
  const aircraftRef = useRef();

  return (
    <>
      <ambientLight intensity={1.2} />

      <hemisphereLight
        skyColor="#dbeafe"
        groundColor="#172554"
        intensity={1.5}
      />

      <directionalLight
        position={[10, 20, 10]}
        intensity={3}
        castShadow
      />

      <Sky
        distance={450000}
        sunPosition={[10, 5, 10]}
      />

      <Runway />

      <Aircraft
        ref={aircraftRef}
        telemetry={telemetry}
      />

      <ChaseCamera aircraftRef={aircraftRef} />
    </>
  );
};

const FlightSimulator = ({
  telemetry,
  setTelemetry,
  controlMode,
  setControlMode,
}) => {
  useEffect(() => {
    if (controlMode !== "keyboard") return;

    const handleKeyDown = (event) => {
      const target = event.target;

      // Allow normal typing and interaction with form controls.
      if (
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(
            target.tagName
          )
        )
      ) {
        return;
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const key = event.key.toLowerCase();

      const controlKeys = [
        "w",
        "s",
        "a",
        "d",
        "q",
        "e",
        "arrowup",
        "arrowdown",
        "r",
      ];

      if (!controlKeys.includes(key)) return;

      event.preventDefault();

      setTelemetry((current) => {
        const updated = { ...current };

        switch (key) {
          case "w":
            updated.pitch = Math.min(current.pitch + 2, 25);
            break;

          case "s":
            updated.pitch = Math.max(current.pitch - 2, -20);
            break;

          case "a":
            updated.roll = Math.max(current.roll - 3, -40);
            break;

          case "d":
            updated.roll = Math.min(current.roll + 3, 40);
            break;

          case "q":
            updated.heading = (current.heading - 3 + 360) % 360;
            break;

          case "e":
            updated.heading = (current.heading + 3) % 360;
            break;

          case "arrowup":
            updated.throttle = Math.min(current.throttle + 5, 100);
            break;

          case "arrowdown":
            updated.throttle = Math.max(current.throttle - 5, 0);
            break;

          case "r":
            updated.pitch = 0;
            updated.roll = 0;
            break;

          default:
            return current;
        }

        return updated;
      });
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [controlMode, setTelemetry]);

  return (
    <>
      <section className="simulator-card">
        <div className="simulator-header">
          <div>
            <h2>Live Flight Simulator</h2>

            <p>
              {controlMode === "keyboard"
                ? "W/S Pitch · A/D Roll · Q/E Heading · ↑/↓ Throttle · R Level Aircraft"
                : "Aircraft controls follow incoming backend telemetry."}
            </p>
          </div>

          <label htmlFor="control-mode">
            Control Mode{" "}
            <select
              id="control-mode"
              value={controlMode}
              onChange={(event) =>
                setControlMode(event.target.value)
              }
            >
              <option value="keyboard">Keyboard</option>
              <option value="iot">IoT / ESP32</option>
            </select>
          </label>
        </div>

        <div className="canvas-wrapper">
          <Canvas
            shadows
            camera={{
              position: [0, 5, 15],
              fov: 55,
              near: 0.1,
              far: 2000,
            }}
          >
            <FlightScene telemetry={telemetry} />
          </Canvas>

          <FlightHUD telemetry={telemetry} />
        </div>
      </section>

      <TelemetryPanel telemetry={telemetry} />
    </>
  );
};

export default FlightSimulator;