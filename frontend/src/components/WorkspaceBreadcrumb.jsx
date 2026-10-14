import { useLocation } from 'react-router-dom';

const names = { '/': 'Dashboard', '/simulator': 'Simulator', '/aircraft': 'Aircraft', '/flights': 'Flights', '/telemetry': 'Telemetry', '/history': 'Reports', '/maintenance': 'Maintenance', '/iot-devices': 'IoT Devices' };

export default function WorkspaceBreadcrumb() {
  const { pathname } = useLocation();
  return <div className="workspace-breadcrumb" aria-label="Current workspace">Workspace <span aria-hidden="true">/</span> {pathname.startsWith('/reports/') ? 'Reports' : names[pathname] ?? 'Workspace'}</div>;
}
