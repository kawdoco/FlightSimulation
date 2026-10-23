import Icon from './Icon';

export default function MetricCard({ title, value, icon }) {
  return <div className="telemetry-card"><Icon name={icon} size={28} /><div><span>{title}</span><strong>{value}</strong></div></div>;
}
