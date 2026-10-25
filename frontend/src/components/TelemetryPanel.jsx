import MetricCard from './MetricCard';

export default function TelemetryPanel({ telemetry }) {
  const format = (value, decimals = 0) => (Number(value) || 0).toFixed(decimals);
  const items = [
    ['Simulated altitude', `${format(telemetry.altitude)} ft`, 'altitude'],
    ['Speed', `${format(telemetry.speed)} km/h`, 'speed'],
    ['Pitch', `${format(telemetry.pitch, 1)}°`, 'pitch'],
    ['Roll', `${format(telemetry.roll, 1)}°`, 'roll'],
  ];
  return <div className="telemetry-grid simulator-metrics">{items.map(([title, value, icon]) => <MetricCard key={title} title={title} value={value} icon={icon} />)}</div>;
}
