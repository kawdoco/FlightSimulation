const TelemetryPanel = ({ telemetry }) => {
  const items = [
    {
      label: "Altitude",
      value: `${telemetry.altitude.toFixed(0)} ft`,
    },
    {
      label: "Speed",
      value: `${telemetry.speed.toFixed(0)} km/h`,
    },
    {
      label: "Pitch",
      value: `${telemetry.pitch.toFixed(1)}°`,
    },
    {
      label: "Roll",
      value: `${telemetry.roll.toFixed(1)}°`,
    },
    {
      label: "Heading",
      value: `${telemetry.heading.toFixed(0)}°`,
    },
    {
      label: "Throttle",
      value: `${telemetry.throttle.toFixed(0)}%`,
    },
    {
      label: "Fuel",
      value: `${telemetry.fuel.toFixed(1)}%`,
    },
  ];

  return (
    <div className="telemetry-grid">
      {items.map((item) => (
        <div
          className="telemetry-card"
          key={item.label}
        >
          <span>{item.label}</span>

          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default TelemetryPanel;