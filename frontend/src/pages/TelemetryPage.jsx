import { useEffect, useState } from "react";
import {
  connectTelemetryWebSocket,
  disconnectTelemetryWebSocket,
} from "../services/telemetryService";

const TelemetryPage = () => {
  const [telemetry, setTelemetry] = useState({
    altitude: 0,
    speed: 0,
    pitch: 0,
    roll: 0,
    heading: 0,
    throttle: 0,
    fuel: 100,
  });

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const client = connectTelemetryWebSocket(
      (data) => {
        console.log("Live telemetry:", data);

        setTelemetry(data);
        setConnected(true);
      },
      1
    );

    return () => {
      if (client) {
        disconnectTelemetryWebSocket();
      }
    };
  }, []);

  return (
    <div className="telemetry-page">

      <div className="page-header">
        <div>
          <h1>Live Telemetry Monitoring</h1>
          <p>
            Real-time aircraft flight data and
            system monitoring
          </p>
        </div>

        <div
          className={
            connected
              ? "connection-status connected"
              : "connection-status"
          }
        >
          ● {connected ? "CONNECTED" : "WAITING"}
        </div>
      </div>

      <div className="telemetry-grid">

        <TelemetryCard
          title="Altitude"
          value={`${telemetry.altitude?.toFixed(0) ?? 0} ft`}
        />

        <TelemetryCard
          title="Speed"
          value={`${telemetry.speed?.toFixed(0) ?? 0} km/h`}
        />

        <TelemetryCard
          title="Heading"
          value={`${telemetry.heading?.toFixed(0) ?? 0}°`}
        />

        <TelemetryCard
          title="Fuel"
          value={`${telemetry.fuel?.toFixed(1) ?? 0}%`}
        />

        <TelemetryCard
          title="Pitch"
          value={`${telemetry.pitch?.toFixed(1) ?? 0}°`}
        />

        <TelemetryCard
          title="Roll"
          value={`${telemetry.roll?.toFixed(1) ?? 0}°`}
        />

        <TelemetryCard
          title="Throttle"
          value={`${telemetry.throttle?.toFixed(0) ?? 0}%`}
        />

        <TelemetryCard
          title="Flight"
          value="FS-001"
        />

      </div>

    </div>
  );
};

const TelemetryCard = ({ title, value }) => {
  return (
    <div className="telemetry-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
};

export default TelemetryPage;