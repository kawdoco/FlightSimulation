import {useEffect,useState} from 'react';
import axios from 'axios';
import {API_BASE_URL} from './services/endpoints';
export default function OperationsPanel(){
 const [page,setPage]=useState(0),[revision,setRevision]=useState(0);
 const [records,setRecords]=useState([]),[last,setLast]=useState(true);
 const [health,setHealth]=useState('Checking'),[busy,setBusy]=useState(true),[error,setError]=useState('');
 const [checkedAt,setCheckedAt]=useState(null);
 useEffect(()=>{
  let active=true;const controller=new AbortController();setBusy(true);setError('');setHealth('Checking');
  Promise.allSettled([
   axios.get(`${API_BASE_URL}/operations/readiness`,{signal:controller.signal}),
   axios.get(`${API_BASE_URL}/operations/audit`,{params:{page},signal:controller.signal})
  ]).then(([readiness,audit])=>{
   if(!active)return;
   setHealth(readiness.status==='fulfilled'?'UP':readiness.reason?.response?.status===503?'DOWN':'Unavailable');
   setCheckedAt(Date.now());
   if(audit.status==='fulfilled'){setRecords(audit.value.data.content);setLast(audit.value.data.last);}
   else {setRecords([]);setLast(true);setError('Unable to load audit records. Try refreshing.');}
  }).finally(()=>{if(active)setBusy(false);});
  return()=>{active=false;controller.abort();};
 },[page,revision]);
 return <section className="operations-panel"><div className="operations-heading"><div><h2>System operations</h2><p>Database readiness and recorded workspace actions.</p></div><button disabled={busy} onClick={()=>setRevision(r=>r+1)}>Refresh</button></div>
 <div className="operations-health" role="status"><strong>Database: {health}</strong><span>{checkedAt?`Last checked ${new Date(checkedAt).toLocaleTimeString()}`:'Checking readiness…'}</span></div>
 {error&&<p role="alert" className="auth-error">{error}</p>}
 <h3>Audit trail</h3>{busy?<p role="status">Loading operations…</p>:<>
 <div className="table-wrapper"><table><caption>Recent actions, newest first</caption><thead><tr><th scope="col">Time</th><th scope="col">Actor</th><th scope="col">Action</th><th scope="col">Target</th></tr></thead><tbody>{records.map(r=><tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.actor}</td><td>{r.action.replaceAll('_',' ')}</td><td>{r.target}</td></tr>)}</tbody></table></div>
 {!records.length&&!error&&<p>No recorded actions on this page.</p>}
 </>}<nav aria-label="Audit trail pages"><button disabled={busy||page===0} onClick={()=>setPage(p=>p-1)}>Previous</button> <span>Page {page+1}</span> <button disabled={busy||last} onClick={()=>setPage(p=>p+1)}>Next</button></nav></section>;
}
