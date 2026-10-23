import {useEffect,useState} from 'react';
import axios from 'axios';
import {API_BASE_URL} from './services/endpoints';
const url=`${API_BASE_URL}/users`;
export default function UserManagement({username}){
 const [users,setUsers]=useState([]),[page,setPage]=useState(0),[last,setLast]=useState(true);
 const [name,setName]=useState(''),[password,setPassword]=useState(''),[role,setRole]=useState('VIEWER');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function load(){const {data}=await axios.get(url,{params:{page}});setUsers(data.content);setLast(data.last);}
 useEffect(()=>{let active=true;setBusy(true);axios.get(url,{params:{page}}).then(({data})=>{if(active){setUsers(data.content);setLast(data.last);}}).catch(()=>{if(active)setError('Unable to load users');}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[page]);
 async function run(fn){setBusy(true);setError('');try{await fn();await load();}catch(e){setError(e.response?.data?.error||'Unable to save user. Check the input and retry.');}finally{setBusy(false);}}
 return <section className="notice-card"><h2>User administration</h2>{error&&<p role="alert">{error}</p>}
 <form onSubmit={e=>{e.preventDefault();run(async()=>{await axios.post(url,{username:name,password,role});setName('');setPassword('');});}}>
 <label>Username <input required pattern="[A-Za-z0-9._-]{3,100}" value={name} onChange={e=>setName(e.target.value)}/></label>
 <label>Initial password <input required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label>
 <label>Role <select value={role} onChange={e=>setRole(e.target.value)}>{['VIEWER','OPERATOR','ADMIN'].map(r=><option key={r}>{r}</option>)}</select></label><button disabled={busy}>Create user</button></form>
 <table><caption>Workspace accounts</caption><thead><tr><th>Username</th><th>Role</th><th>Access</th></tr></thead><tbody>{users.map(u=><tr key={u.username}><td>{u.username}</td><td><select aria-label={`Role for ${u.username}`} value={u.role} disabled={busy||u.username===username||u.username==='admin'} onChange={e=>run(()=>axios.patch(`${url}/${encodeURIComponent(u.username)}`,{role:e.target.value,enabled:u.enabled}))}>{['VIEWER','OPERATOR','ADMIN'].map(r=><option key={r}>{r}</option>)}</select></td><td><button disabled={busy||u.username===username||u.username==='admin'} onClick={()=>run(()=>axios.patch(`${url}/${encodeURIComponent(u.username)}`,{role:u.role,enabled:!u.enabled}))}>{u.enabled?'Disable':'Enable'}</button></td></tr>)}</tbody></table>
 <button disabled={busy||page===0} onClick={()=>setPage(p=>p-1)}>Previous</button> Page {page+1} <button disabled={busy||last} onClick={()=>setPage(p=>p+1)}>Next</button></section>;
}
