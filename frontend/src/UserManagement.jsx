import {useEffect,useState} from 'react';
import axios from 'axios';
import {API_BASE_URL} from './services/endpoints';
import './userManagement.css';
const url=`${API_BASE_URL}/users`;
export default function UserManagement({username}){
 const [users,setUsers]=useState([]),[page,setPage]=useState(0),[last,setLast]=useState(true);
 const [name,setName]=useState(''),[password,setPassword]=useState(''),[role,setRole]=useState('VIEWER');
 const [error,setError]=useState(''),[success,setSuccess]=useState(''),[busy,setBusy]=useState(false);
 async function load(){const {data}=await axios.get(url,{params:{page}});setUsers(data.content);setLast(data.last);}
 useEffect(()=>{let active=true;setBusy(true);setError('');axios.get(url,{params:{page}}).then(({data})=>{if(active){setUsers(data.content);setLast(data.last);}}).catch(()=>{if(active)setError('Unable to load users');}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[page]);
 async function run(fn,message){setBusy(true);setError('');setSuccess('');try{await fn();await load();setSuccess(message);}catch(e){setError(e.response?.data?.error||'Unable to save user. Check the input and retry.');}finally{setBusy(false);}}
 return <section className="user-management" aria-labelledby="user-management-title">
 <header className="users-heading"><div><span className="users-eyebrow">Workspace access</span><h2 id="user-management-title">User administration</h2><p>Create accounts and manage their workspace permissions.</p></div><span className="users-page-label">Administrator tools</span></header>
 {error&&<p role="alert" className="users-message users-error">{error}</p>}{success&&<p role="status" className="users-message users-success">{success}</p>}
 <div className="users-layout"><aside className="users-create"><h3>Create an account</h3><p>Choose the access level for your new team member.</p>
 <form onSubmit={e=>{e.preventDefault();run(async()=>{await axios.post(url,{username:name,password,role});setName('');setPassword('');},'User created successfully.');}}>
 <label>Username <input required autoComplete="off" pattern="[A-Za-z0-9._-]{3,100}" aria-describedby="username-help" value={name} onChange={e=>setName(e.target.value)}/></label><small id="username-help">3 to 100 letters, numbers, dots, underscores or hyphens.</small>
 <label>Initial password <input required type="password" autoComplete="new-password" minLength={12} maxLength={128} aria-describedby="password-help" value={password} onChange={e=>setPassword(e.target.value)}/></label><small id="password-help">Use 12 to 128 characters.</small>
 <label>Role <select value={role} onChange={e=>setRole(e.target.value)}>{['VIEWER','OPERATOR','ADMIN'].map(r=><option key={r}>{r}</option>)}</select></label>
 <p className="users-role-help">{role==='ADMIN'?'Manages accounts, fleet and operations.':role==='OPERATOR'?'Operates flights, simulation and maintenance.':'Monitors fleet, telemetry and reports.'}</p>
 <button className="users-primary" disabled={busy}>Create user</button></form></aside>
 <div className="users-accounts"><div className="users-list-heading"><div><h3>Workspace accounts</h3><p>Manage roles and account access.</p></div><span>{users.length} on this page</span></div>
 <div className="users-table-scroll" tabIndex={0} aria-label="Workspace accounts table"><table aria-busy={busy}><caption className="users-sr-only">Workspace accounts</caption><thead><tr><th scope="col">Username</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Access</th></tr></thead><tbody>{users.map(u=><tr key={u.username}><td>{u.username}{u.username===username&&<small className="users-self">Your account</small>}</td><td><select aria-label={`Role for ${u.username}`} value={u.role} disabled={busy||u.username===username||u.username==='admin'} onChange={e=>run(()=>axios.patch(`${url}/${encodeURIComponent(u.username)}`,{role:e.target.value,enabled:u.enabled}),'Account role updated.')}>{['VIEWER','OPERATOR','ADMIN'].map(r=><option key={r}>{r}</option>)}</select></td><td><span className={`users-status ${u.enabled?'is-enabled':'is-disabled'}`}>{u.enabled?'Enabled':'Disabled'}</span></td><td><button disabled={busy||u.username===username||u.username==='admin'} title={u.username===username||u.username==='admin'?'This account is protected':undefined} onClick={()=>run(()=>axios.patch(`${url}/${encodeURIComponent(u.username)}`,{role:u.role,enabled:!u.enabled}),'Account access updated.')}>{u.enabled?'Disable':'Enable'}</button></td></tr>)}</tbody></table></div>
 {busy&&<p role="status" className="users-loading">Updating accounts...</p>}{!busy&&!error&&users.length===0&&<p className="users-empty">No accounts on this page.</p>}
 <footer className="users-pagination"><span>Page {page+1}</span><nav aria-label="Account pages"><button disabled={busy||page===0} onClick={()=>setPage(p=>p-1)}>Previous</button><button disabled={busy||last} onClick={()=>setPage(p=>p+1)}>Next</button></nav></footer>
 <p className="users-protection-note">Your account and the default admin account are protected from role and access changes.</p></div></div></section>;
}
