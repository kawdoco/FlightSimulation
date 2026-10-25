import {Navigate,Link} from 'react-router-dom';
import {useAccess} from './RoleContext';
import {routeAllowed} from './rolePolicy';
export default function AccessRoute({path,children}){const {role}=useAccess();if(routeAllowed(role,path))return children;if(path==='/simulator')return <Navigate to="/telemetry" replace/>;return <section className="role-route-denied"><h1>Access restricted</h1><p>Your workspace role cannot open this page.</p><Link to="/">Return to your workspace</Link></section>;}
