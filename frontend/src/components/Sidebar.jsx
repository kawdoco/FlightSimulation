import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';

const links = [
  ['/', 'Dashboard', 'dashboard'],
  ['/aircraft', 'Aircraft', 'aircraft'],
  ['/flights', 'Flights', 'flights'],
  ['/simulator', 'Simulator', 'simulator'],
  ['/telemetry', 'Telemetry', 'telemetry'],
  ['/history', 'Flight Reports', 'report'],
  ['/maintenance', 'Maintenance', 'maintenance'],
  ['/iot-devices', 'IoT Devices', 'chip'],
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return <aside className="sidebar">
    <div className="logo"><h2><Icon name="aircraft" size={50} />AeroSim</h2><span>Flight Simulation</span></div>
    <nav aria-label="Main navigation">
      {links.map(([to, label, icon]) => {
        const reportActive = to === '/history' && pathname.startsWith('/reports/');
        return <NavLink key={to} to={to} end={to === '/'} aria-current={reportActive ? 'page' : undefined} className={({ isActive }) => `sidebar-link${isActive || reportActive ? ' active' : ''}`}><Icon name={icon} /><span>{label}</span></NavLink>;
      })}
    </nav>
    <div className="sidebar-footer">FlightSimulation Team</div>
  </aside>;
}
