import { useEffect, useState } from 'react';
import { telemetryFreshness } from '../services/telemetryFreshness';
export default function TelemetryStatus({ lastReceivedAt }) {
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(timer);},[]);
 const status=telemetryFreshness(lastReceivedAt,now);
 const label={waiting:'Waiting for telemetry',live:'Live telemetry',stale:'Telemetry stale — showing last received values'}[status];
 return <div><div role="status" className={`connection-status${status==='live'?' connected':''}`}><span aria-hidden="true">?</span>{label}</div>{lastReceivedAt!=null&&<p className="telemetry-received-at">Last received: {new Date(lastReceivedAt).toLocaleTimeString()}</p>}</div>;
}
