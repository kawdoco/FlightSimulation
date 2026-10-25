import { sensorWarnings } from '../services/sensorHealth';
export default function SensorHealth({ telemetry, received }) {
  if (!received) return null;
  const warnings = sensorWarnings(telemetry);
  return warnings.length ? <div className="notice-card" role="status"><div>{warnings.map(message => <p key={message}>{message}</p>)}</div></div> : null;
}
