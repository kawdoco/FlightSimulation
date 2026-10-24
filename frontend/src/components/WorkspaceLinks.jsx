import {Link} from 'react-router-dom';
import {useAccess} from '../access/RoleContext';
export default function WorkspaceLinks(){const {canOperate}=useAccess();return <nav className="role-page-links" aria-label="Workspace shortcuts"><Link to="/flights">Flights</Link>{canOperate&&<Link to="/simulator">Simulator</Link>}<Link to="/telemetry">Telemetry</Link><Link to="/history">Reports</Link></nav>;}
