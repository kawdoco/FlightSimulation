import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useAccess} from '../access/RoleContext';
import {getAllAircraft} from '../services/aircraftService';
import {getAllFlights} from '../services/flightService';
import TelemetryStatus from '../components/TelemetryStatus';
import './roleWorkspace.css';
export default function RoleLanding({lastReceivedAt}){
 const {role,label,canOperate,isAdmin}=useAccess();
 const [data,setData]=useState(null),[error,setError]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{let active=true;setData(null);setError('');Promise.all([getAllAircraft(),getAllFlights()]).then(([aircraft,flights])=>{if(active)setData({aircraft,flights});}).catch(()=>{if(active)setError('Unable to load workspace overview. Try again.');});return()=>{active=false;};},[role,reload]);
 const title=isAdmin?'Administration overview':canOperate?'Flight operations':'Monitoring overview';
 return <section className="role-workspace"><div className="page-header"><div><p className="role-eyebrow">{label} workspace</p><h1>{title}</h1><p>{isAdmin?'Manage fleet, accounts and operational records.':canOperate?'Manage flights and open the live simulator.':'Read-only fleet information, telemetry and flight reports.'}</p></div><TelemetryStatus lastReceivedAt={lastReceivedAt}/></div>
 {error?<div className="notice-card" role="alert">{error} <button onClick={()=>setReload(r=>r+1)}>Retry overview</button></div>:!data?<p role="status">Loading workspace overview...</p>:<div className="role-metrics">{[['Aircraft',data.aircraft.length,'/aircraft'],['Available aircraft',data.aircraft.filter(a=>a.status==='AVAILABLE').length,'/aircraft'],['Flights',data.flights.length,'/flights'],['In progress',data.flights.filter(f=>f.status==='IN_PROGRESS').length,'/flights']].map(([name,value,to])=><Link className="role-metric" key={name} to={to}><span>{name}</span><strong>{value}</strong></Link>)}</div>}
 {canOperate?<Link className="role-simulator-launch" to="/simulator"><div><span>Flight simulation</span><h2>Open simulator</h2><p>Existing keyboard and IoT controls, cameras and audio.</p></div><span aria-hidden="true">→</span></Link>:<Link className="role-simulator-launch" to="/telemetry"><div><h2>Open live monitoring</h2><p>View the existing telemetry feed without changing flight controls.</p></div></Link>}
 <div className="role-quick-links">{(isAdmin?[['/users','User management'],['/aircraft','Aircraft management'],['/flights','Flight management'],['/maintenance','Maintenance'],['/history','Reports'],['/operations','Audit & readiness']]:canOperate?[['/flights','Manage flights'],['/telemetry','Live telemetry'],['/iot-devices','IoT freshness'],['/maintenance','Maintenance'],['/history','History & reports']]:[['/aircraft','View aircraft'],['/flights','View flights'],['/history','History & reports'],['/maintenance','Maintenance status']]).map(([to,text])=><Link key={to} to={to}>{text}</Link>)}</div>
 <p className="role-feed-note">Live telemetry shows received packets, not database recording success. The configured feed is unchanged; opening or starting a flight does not assign IoT recording to it.</p>
 </section>;
}
