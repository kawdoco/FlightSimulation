export default function FlightHUD({ telemetry, controlMode, cameraMode = 'chase' }) {
  const format = (value, decimals = 0) => (Number(value) || 0).toFixed(decimals);
  const warnings = [];
  if (telemetry.speed > 0 && telemetry.speed < 100 && telemetry.altitude > 100) warnings.push('STALL WARNING');
  if (telemetry.speed > 280) warnings.push('OVERSPEED');
  if (telemetry.fuel < 20) warnings.push('LOW FUEL');
  if (telemetry.pitch > 20) warnings.push('HIGH PITCH');
  const roll = Math.max(-45, Math.min(45, Number(telemetry.roll) || 0));
  return <div className="flight-hud">
    <div className="instrument-bar" aria-label="Flight instruments">
      {[
        ['Altitude', `${format(telemetry.altitude)} ft`],
        ['Airspeed', `${format(telemetry.speed)} km/h`],
        ['Heading', `${format(telemetry.heading).padStart(3, '0')}°`],
        ['Throttle', `${format(telemetry.throttle)}%`],
        ['Fuel', `${format(telemetry.fuel)}%`],
      ].map(([label, value]) => <div className="instrument-reading" key={label}><span>{label.toUpperCase()}</span><strong>{value}</strong></div>)}
    </div>
    <div className="hud-center"><div className="crosshair"><span /><span /></div><div className="hud-attitude"><span>PITCH {format(telemetry.pitch, 1)}°</span><span>ROLL {roll.toFixed(1)}°</span></div></div>
    <div className="viewport-mode">{cameraMode.toUpperCase()} CAMERA{controlMode === 'iot' ? ' · IoT / ESP32' : ''}</div>
    {warnings.length > 0 && <div className="warning-panel" role="status">{warnings.map(warning => <div key={warning} className="flight-warning">⚠ {warning}</div>)}</div>}
  </div>;
}
