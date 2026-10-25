import {useAccess} from '../access/RoleContext';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/endpoints';
import { getAllAircraft } from '../services/aircraftService';
const endpoint = `${API_BASE_URL}/maintenance`;
export default function MaintenancePage() {
 const {canOperate}=useAccess();
 const [aircraft,setAircraft]=useState([]), [records,setRecords]=useState([]);
 const [aircraftId,setAircraftId]=useState(''), [description,setDescription]=useState('');
 const [page,setPage]=useState(0), [last,setLast]=useState(true);
 const [busy,setBusy]=useState(false), [loading,setLoading]=useState(true), [error,setError]=useState('');
 async function load() {
  const {data}=await axios.get(endpoint,{params:{page}});
  setRecords(data.content); setLast(data.last);
 }
 useEffect(()=>{
  let active=true; setLoading(true); setError('');
  Promise.all([axios.get(endpoint,{params:{page}}),getAllAircraft()]).then(([response,items])=>{
   if(active){setRecords(response.data.content);setLast(response.data.last);setAircraft(items);}
  }).catch(()=>{if(active)setError('Unable to load maintenance records. Please retry.');})
  .finally(()=>{if(active)setLoading(false);});
  return ()=>{active=false;};
 },[page]);
 async function action(operation) {
  setBusy(true);setError('');
  try {await operation();await load();} catch(err){setError(err.response?.data?.error || 'Unable to save changes. Refresh and try again.');}
  finally {setBusy(false);}
 }
 return <section>
  <div className="page-header"><div><h1>Maintenance</h1><p>Register work and track progress for each aircraft.</p></div></div>
  {error && <p role="alert">{error}</p>}
  {canOperate ? <form className="notice-card" onSubmit={e=>{e.preventDefault();action(async()=>{
   await axios.post(endpoint,{aircraftId:Number(aircraftId),description});setDescription('');
  });}}>
   <label htmlFor="maintenance-aircraft">Aircraft</label><select id="maintenance-aircraft" required value={aircraftId} onChange={e=>setAircraftId(e.target.value)} disabled={busy||loading}>
    <option value="">Select aircraft</option>{aircraft.map(a=><option key={a.id} value={a.id}>{a.registrationNumber}</option>)}
   </select>
   <label>Work description <textarea required maxLength={1000} value={description} onChange={e=>setDescription(e.target.value)} disabled={busy}/></label>
   <button disabled={busy||loading||!description.trim()||!aircraftId}>Create record</button>
  </form> : <p className="role-readonly">Read-only maintenance status. Operators manage work orders.</p>}
  {loading ? <p role="status">Loading maintenance records�</p> : <>
   <table><caption>Maintenance work orders</caption><thead><tr><th>Aircraft</th><th>Description</th><th>Status</th><th>Created</th><th>Action</th></tr></thead>
    <tbody>{records.map(r=><tr key={r.id}><td>{aircraft.find(a=>a.id===r.aircraftId)?.registrationNumber || r.aircraftId}</td><td>{r.description}</td><td>{r.status}</td><td>{new Date(r.createdAt).toLocaleString()}</td><td>{canOperate && r.status!=='COMPLETED' && <button disabled={busy} onClick={()=>action(()=>axios.patch(`${endpoint}/${r.id}/status`,{status:r.status==='OPEN'?'IN_PROGRESS':'COMPLETED'}))}>{r.status==='OPEN'?'Start work':'Complete work'}</button>}</td></tr>)}</tbody>
   </table>
   {!records.length && <p>No maintenance records on this page.</p>}
   <nav aria-label="Maintenance pages"><button disabled={busy||page===0} onClick={()=>setPage(p=>p-1)}>Previous</button> <span>Page {page+1}</span> <button disabled={busy||last} onClick={()=>setPage(p=>p+1)}>Next</button></nav>
  </>}
 </section>;
}
