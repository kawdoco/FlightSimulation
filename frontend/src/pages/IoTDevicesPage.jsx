import Icon from '../components/Icon';
import MetricCard from '../components/MetricCard';

export default function IoTDevicesPage({ telemetry, hasReceivedTelemetry }) {
  const fields = [['Altitude', 'altitude', ' ft'], ['Speed', 'speed', ' km/h'], ['Pitch', 'pitch', '°'], ['Roll', 'roll', '°'], ['Heading', 'heading', '°'], ['Throttle', 'throttle', '%'], ['Fuel', 'fuel', '%']];
  return <section>
    <div className="page-header"><div><h1>IoT Devices</h1><p>Live telemetry received by the application.</p></div><div role="status" className={`connection-status${hasReceivedTelemetry ? ' connected' : ''}`}><span aria-hidden="true">●</span>{hasReceivedTelemetry ? 'Data received' : 'Waiting for telemetry'}</div></div>
    <div className="notice-card"><Icon name="info" size={30} /><div><h2>{hasReceivedTelemetry ? 'Telemetry received during this session' : 'Connect your ESP32 to begin sending telemetry'}</h2><p>{hasReceivedTelemetry ? 'The latest received values are shown below.' : 'Once your configured flight receives telemetry, its values will appear below.'}</p></div></div>
    <div className="telemetry-grid iot-metrics">{fields.map(([title, field, unit]) => <MetricCard key={field} title={title} icon={field} value={`${(Number(telemetry[field]) || 0).toFixed(0)}${unit}`} />)}</div>
    <div className="raw-telemetry"><h2>Raw telemetry (JSON)</h2><pre>{JSON.stringify(telemetry, null, 2)}</pre></div>
  </section>;
}
