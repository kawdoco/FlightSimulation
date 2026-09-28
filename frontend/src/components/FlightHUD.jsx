const FlightHUD = ({ telemetry }) => {
  const warnings = [];
  const visualRoll = Math.max(
    -45,
    Math.min(45, Number(telemetry.roll) || 0)
  );

  if (
    telemetry.speed > 0 &&
    telemetry.speed < 100 &&
    telemetry.altitude > 100
  ) {
    warnings.push("STALL WARNING");
  }

  if (telemetry.speed > 280) {
    warnings.push("OVERSPEED");
  }

  if (telemetry.fuel < 20) {
    warnings.push("LOW FUEL");
  }

  if (telemetry.pitch > 20) {
    warnings.push("HIGH PITCH");
  }

  return (
    <div className="flight-hud">
      <div className="hud-left">
        <div>
          ALT
          <strong>
            {telemetry.altitude.toFixed(0)}
          </strong>
        </div>

        <div>
          SPD
          <strong>
            {telemetry.speed.toFixed(0)}
          </strong>
        </div>
      </div>

      <div className="hud-center">
        <div className="crosshair">
          <span></span>
          <span></span>
        </div>

        <div className="hud-heading">
          HDG {telemetry.heading.toFixed(0)}°
        </div>

        <div className="hud-attitude">
          PITCH {telemetry.pitch.toFixed(1)}°
          &nbsp; | &nbsp;
          ROLL {visualRoll.toFixed(1)}°
        </div>
      </div>

      <div className="hud-right">
        <div>
          THR
          <strong>
            {telemetry.throttle.toFixed(0)}%
          </strong>
        </div>

        <div>
          FUEL
          <strong>
            {telemetry.fuel.toFixed(1)}%
          </strong>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="warning-panel">
          {warnings.map((warning) => (
            <div
              key={warning}
              className="flight-warning"
            >
              ⚠ {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlightHUD;