import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";

import Aircraft from "./Aircraft";
import Runway from "./Runway";
import FlightEnvironment from "./FlightEnvironment";
import Atmosphere from "./Atmosphere";
import ChaseCamera from "./ChaseCamera";
import { advanceSpeed } from "./speedDynamics";

import TelemetryPanel from "../components/TelemetryPanel";
import FlightHUD from "../components/FlightHUD";
import Icon from "../components/Icon";

const FlightScene = ({ telemetry }) => {
  const aircraftRef = useRef();

  return (
    <>
      <color attach="background" args={["#9dbcd5"]} />
      <fog attach="fog" args={["#abc0cf", 450, 1550]} />
      <ambientLight intensity={0.65} />

      <hemisphereLight
        skyColor="#dbeafe"
        groundColor="#6d7055"
        intensity={0.9}
      />

      <directionalLight
        position={[-35, 65, 25]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={180}
        shadow-bias={-0.0002}
      />

      <Atmosphere />

      <FlightEnvironment />
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

    let previousTime = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsedSeconds = (now - previousTime) / 1000;
      previousTime = now;

      setTelemetry((current) => {
        const speed = advanceSpeed(current.speed, current.throttle, elapsedSeconds);
        return speed === current.speed ? current : { ...current, speed };
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [controlMode, setTelemetry]);

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
          <div className="simulator-mode">
            <span>Control mode</span>
            <div className="mode-switch" role="group" aria-label="Control mode">
              <button type="button" aria-pressed={controlMode === "keyboard"} onClick={() => setControlMode("keyboard")}><Icon name="keyboard" />Keyboard</button>
              <button type="button" aria-pressed={controlMode === "iot"} onClick={() => setControlMode("iot")}><Icon name="chip" />IoT / ESP32</button>
            </div>
          </div>
          <button type="button" className="level-button" disabled={controlMode !== "keyboard"} onClick={() => setTelemetry(current => ({ ...current, pitch: 0, roll: 0 }))}><Icon name="level" />Level aircraft<kbd>R</kbd></button>
        </div>

        <div className="canvas-wrapper">
          <Canvas
            shadows
            camera={{
              position: [0, 5, 15],
              fov: 55,
              near: 0.1,
              far: 4000,
            }}
          >
            <FlightScene telemetry={telemetry} />
          </Canvas>

          <FlightHUD telemetry={telemetry} controlMode={controlMode} />
        </div>
      </section>

      {controlMode === "keyboard" ? <div className="controls-strip" aria-label="Keyboard controls">
        {[["W", "S", "Pitch"], ["A", "D", "Roll"], ["Q", "E", "Heading"], ["↑", "↓", "Throttle"], ["R", null, "Level aircraft"]].map(([first, second, label]) => <div className="control-hint" key={label}><kbd>{first}</kbd>{second && <kbd>{second}</kbd>}<span>{label}</span></div>)}
      </div> : <div className="controls-strip iot-hint"><Icon name="info" />Aircraft controls follow incoming backend telemetry. Keyboard controls are paused.</div>}
      <TelemetryPanel telemetry={telemetry} />
    </>
  );
};

export default FlightSimulator;
