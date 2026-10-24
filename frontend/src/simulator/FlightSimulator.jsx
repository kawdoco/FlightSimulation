import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

import Aircraft from "./Aircraft";
import Runway from "./Runway";
import FlightEnvironment from "./FlightEnvironment";
import Atmosphere from "./Atmosphere";
import ChaseCamera from "./ChaseCamera";
import { advanceSpeed, advanceAltitude } from "./speedDynamics";
import { CAMERA_VIEWS, QUALITY_PRESETS } from "./sceneSettings";
import useFlightAudio from "./useFlightAudio";

import TelemetryPanel from "../components/TelemetryPanel";
import FlightHUD from "../components/FlightHUD";
import Icon from "../components/Icon";

const FlightScene = ({ telemetry, cameraMode, quality, resetVersion }) => {
  const aircraftRef = useRef();
  const sunlightRef = useRef();
  const settings = QUALITY_PRESETS[quality];
  useFrame(() => {
    if (!aircraftRef.current || !sunlightRef.current) return;
    const position = aircraftRef.current.position;
    sunlightRef.current.position.set(position.x - 35, position.y + 65, position.z + 25);
    sunlightRef.current.target.position.copy(position);
    sunlightRef.current.target.updateMatrixWorld();
  });

  return (
    <>
      <color attach="background" args={["#9dbcd5"]} />
      <fog attach="fog" args={["#a9c0d2", 650, 2800]} />
      <ambientLight intensity={0.65} />

      <hemisphereLight
        skyColor="#dbeafe"
        groundColor="#727b83"
        intensity={0.9}
      />

      <directionalLight
        ref={sunlightRef}
        key={quality}
        position={[-35, 65, 25]}
        intensity={2.2}
        castShadow={settings.shadows}
        shadow-mapSize={[settings.shadowSize, settings.shadowSize]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={180}
        shadow-bias={-0.0002}
      />

      <Atmosphere />

      <FlightEnvironment quality={quality} />
      <Runway />

      <Aircraft key={resetVersion}
        ref={aircraftRef}
        telemetry={telemetry}
      />

      <ChaseCamera aircraftRef={aircraftRef} cameraMode={cameraMode} />
    </>
  );
};

const FlightSimulator = ({
  telemetry: inputTelemetry,
  setTelemetry,
  controlMode,
  setControlMode,
}) => {
  const [iotStale, setIotStale] = useState(false);
  const [headingOrigin, setHeadingOrigin] = useState(0);
  const [resetVersion, setResetVersion] = useState(0);
  function restartAircraft() {
    setIotAltitude(0);
    setHeadingOrigin(Number(inputTelemetry.heading) || 0);
    if (controlMode === 'keyboard') {
      setTelemetry(current => ({ ...current, altitude: 0, speed: 0, pitch: 0, roll: 0, heading: 0, throttle: 0 }));
    }
    setResetVersion(version => version + 1);
  }
  const [iotAltitude, setIotAltitude] = useState(0);
  const latestInput = useRef({ value: inputTelemetry, receivedAt: performance.now() });
  useEffect(() => {
    latestInput.current = { value: inputTelemetry, receivedAt: performance.now() };
  }, [inputTelemetry]);
  useEffect(() => {
    if (controlMode !== 'iot') return;
    setIotAltitude(Math.max(0, Number(latestInput.current.value.altitude) || 0));
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = (now - previous) / 1000;
      previous = now;
      const input = latestInput.current;
      const stale = now - input.receivedAt > 10000;
      setIotStale(stale);
      if (stale) return;
      setIotAltitude(current => advanceAltitude(current, Number(input.value.speed), Number(input.value.pitch), delta));
    }, 100);
    return () => window.clearInterval(timer);
  }, [controlMode]);
  const telemetry = controlMode === 'iot' ? { ...inputTelemetry, altitude: iotAltitude, heading: ((Number(inputTelemetry.heading) - headingOrigin) % 360 + 360) % 360, ...(iotStale ? { speed: 0, throttle: 0 } : {}) } : inputTelemetry;
  const [cameraMode, setCameraMode] = useState("chase");
  const [quality, setQuality] = useState("medium");
  const sound = useFlightAudio(telemetry);
  const settings = QUALITY_PRESETS[quality];
  useEffect(() => {
    if (controlMode !== "keyboard") return;

    let previousTime = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsedSeconds = (now - previousTime) / 1000;
      previousTime = now;

      setTelemetry((current) => {
        const speed = advanceSpeed(current.speed, current.throttle, elapsedSeconds);
        const altitude = advanceAltitude(current.altitude, speed, current.pitch, elapsedSeconds);
        return speed === current.speed && altitude === current.altitude
          ? current
          : { ...current, speed, altitude };
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
          <div className="scene-options"><label htmlFor="camera-view">Camera</label><select id="camera-view" value={cameraMode} onChange={event => setCameraMode(event.target.value)}>{Object.entries(CAMERA_VIEWS).map(([value, view]) => <option key={value} value={value}>{view.label}</option>)}</select></div>
          <div className="scene-options"><label htmlFor="scene-quality">Quality</label><select id="scene-quality" value={quality} onChange={event => setQuality(event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <div className="flight-audio-controls">
            <button type="button" className="level-button sound-toggle" aria-pressed={sound.enabled} disabled={sound.busy} onClick={sound.toggle} title="Engine sound follows throttle; wind follows airspeed."><Icon name="sound" size={17} />{sound.busy ? 'Starting…' : sound.enabled ? 'Sound on' : 'Sound off'}</button>
            {sound.enabled && <label className="sound-volume">Volume<input aria-label="Engine sound volume" type="range" min="0" max="100" value={Math.round(sound.volume * 100)} onChange={event => sound.setVolume(Number(event.target.value) / 100)} /></label>}
          </div>
          <button type="button" className="level-button" onClick={restartAircraft} title="Return the simulator aircraft to the runway without signing out. In IoT mode, lower throttle and center the joystick first.">Restart aircraft</button>
          <button type="button" className="level-button" disabled={controlMode !== "keyboard"} onClick={() => setTelemetry(current => ({ ...current, pitch: 0, roll: 0 }))}><Icon name="level" />Level aircraft<kbd>R</kbd></button>
        </div>
        {sound.error && <p className="error-message" role="alert">{sound.error}</p>}

        <div className="canvas-wrapper">
          <Canvas
            shadows={settings.shadows}
            dpr={[1, settings.dpr]}
            frameloop={controlMode === "iot" || Number(telemetry.speed) > 0 ? "always" : "demand"}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            camera={{
              position: [0, 5, 15],
              fov: 55,
              near: 0.1,
              far: 4000,
            }}
          >
            <FlightScene telemetry={telemetry} cameraMode={cameraMode} quality={quality} resetVersion={resetVersion} />
          </Canvas>

          <FlightHUD telemetry={telemetry} controlMode={controlMode} cameraMode={cameraMode} />
        </div>
      </section>

      {controlMode === "keyboard" ? <div className="controls-strip" aria-label="Keyboard controls">
        {[["W", "S", "Pitch"], ["A", "D", "Roll"], ["Q", "E", "Heading"], ["↑", "↓", "Throttle"], ["R", null, "Level aircraft"]].map(([first, second, label]) => <div className="control-hint" key={label}><kbd>{first}</kbd>{second && <kbd>{second}</kbd>}<span>{label}</span></div>)}
      </div> : <div className="controls-strip iot-hint"><Icon name="info" />Use throttle to build speed above 120 km/h, then pull the joystick up to climb. Push down to descend. Simulated altitude follows speed and pitch; raw sensor altitude remains on the telemetry page.</div>}
      <TelemetryPanel telemetry={telemetry} />
    </>
  );
};

export default FlightSimulator;
