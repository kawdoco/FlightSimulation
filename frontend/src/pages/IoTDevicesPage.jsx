export default function IoTDevicesPage({
  telemetry,
  hasReceivedTelemetry,
}) {
  return (
    <section>
      <div className="topbar">
        <div>
          <h1>IoT Devices</h1>
          <p>Live telemetry received by the application</p>
        </div>
      </div>

      <p>
        {hasReceivedTelemetry
          ? "Telemetry has been received during this session."
          : "Waiting for telemetry..."}
      </p>

      <pre style={{ overflowX: "auto" }}>
        {JSON.stringify(telemetry, null, 2)}
      </pre>
    </section>
  );
}