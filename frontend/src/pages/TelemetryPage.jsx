const formatValue = (value, decimals = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(decimals) : "0";
};

function TelemetryPage({ telemetry, hasReceivedTelemetry }) {
  return (
    <div className="telemetry-page">
      <div className="page-header">
        <div>
          <h1>Live Telemetry Monitoring</h1>
          <p>Real-time aircraft flight data and system monitoring</p>
        </div>

        <div
          className={
            hasReceivedTelemetry
              ? "connection-status connected"
              : "connection-status"
          }
        >
          ● {hasReceivedTelemetry ? "DATA RECEIVED" : "WAITING"}
        </div>
      </div>

      <div className="telemetry-grid">
        <TelemetryCard
          title="Altitude"
          value={`${formatValue(telemetry.altitude)} ft`}
        />
        <TelemetryCard
          title="Speed"
          value={`${formatValue(telemetry.speed)} km/h`}
        />
        <TelemetryCard
          title="Heading"
          value={`${formatValue(telemetry.heading)}°`}
        />
        <TelemetryCard
          title="Fuel"
          value={`${formatValue(telemetry.fuel, 1)}%`}
        />
        <TelemetryCard
          title="Pitch"
          value={`${formatValue(telemetry.pitch, 1)}°`}
        />
        <TelemetryCard
          title="Roll"
          value={`${formatValue(telemetry.roll, 1)}°`}
        />
        <TelemetryCard
          title="Throttle"
          value={`${formatValue(telemetry.throttle)}%`}
        />
        <TelemetryCard
          title="Flight"
          value={telemetry.flight?.flightNumber ?? "—"}
        />
      </div>
    </div>
  );
}

function TelemetryCard({ title, value }) {
  return (
    <div className="telemetry-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default TelemetryPage;