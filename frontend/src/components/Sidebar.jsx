import { NavLink, useLocation } from 'react-router-dom';
import Icon from './Icon';

import {useAccess} from '../access/RoleContext';
import {navigation} from '../access/rolePolicy';

export default function Sidebar() {
  const {role,label}=useAccess();
  const links=navigation(role);
  const { pathname } = useLocation();
  return <aside className="sidebar">
    <div className="logo"><h2><Icon name="aircraft" size={50} />AeroSim</h2><span>{label} workspace</span></div>
    <nav aria-label="Main navigation">
      {links.map(([to, label, icon]) => {
        const reportActive = to === '/history' && pathname.startsWith('/reports/');
        return <NavLink key={to} to={to} end={to === '/'} aria-current={reportActive ? 'page' : undefined} className={({ isActive }) => `sidebar-link${isActive || reportActive ? ' active' : ''}`}><Icon name={icon} /><span>{label}</span></NavLink>;
      })}
    </nav>
    <div className="sidebar-footer">FlightSimulation Team</div>
  </aside>;
}
