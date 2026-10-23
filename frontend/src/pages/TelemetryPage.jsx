import TelemetryStatus from '../components/TelemetryStatus';
import MetricCard from '../components/MetricCard';

export default function TelemetryPage({ telemetry, hasReceivedTelemetry, lastReceivedAt }) {
  const format = (value, decimals = 0) => (Number(value) || 0).toFixed(decimals);
  const items = [
    ['Altitude', `${format(telemetry.altitude)} ft`, 'altitude'],
    ['Speed', `${format(telemetry.speed)} km/h`, 'speed'],
    ['Heading', `${format(telemetry.heading)}°`, 'heading'],
    ['Fuel', `${format(telemetry.fuel, 1)}%`, 'fuel'],
    ['Pitch', `${format(telemetry.pitch, 1)}°`, 'pitch'],
    ['Roll', `${format(telemetry.roll, 1)}°`, 'roll'],
    ['Throttle', `${format(telemetry.throttle)}%`, 'throttle'],
    ['Flight', telemetry.flight?.flightNumber ?? '—', 'aircraft'],
  ];
  return <div className="telemetry-page">
    <div className="page-header"><div><h1>Live Telemetry Monitoring</h1><p>Real-time flight data from your connected telemetry source.</p></div><TelemetryStatus lastReceivedAt={lastReceivedAt} /></div>
    <div className="telemetry-grid">{items.map(([title, value, icon]) => <MetricCard key={title} title={title} value={value} icon={icon} />)}</div>
  </div>;
}

