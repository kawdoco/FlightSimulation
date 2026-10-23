import OperationsPanel from './OperationsPanel';
import { setAuthorization, onSessionExpired } from './services/authSession';
import './auth.css';
import UserManagement from './UserManagement';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './services/endpoints';
export default function AuthGate({children}) {
 const [user,setUser]=useState(null),[username,setUsername]=useState('admin'),[password,setPassword]=useState('');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [operations,setOperations]=useState(false);
 const [managing,setManaging]=useState(false);
 const [changing,setChanging]=useState(false),[currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState('');
 useEffect(()=>onSessionExpired(()=>{
  setUser(null);setOperations(false);setManaging(false);setChanging(false);setOperations(false);setCurrentPassword('');setNewPassword('');setPassword('');
  setError('Your access has changed. Please sign in again.');
 }),[]);
 async function changePassword(e){
  e.preventDefault();setBusy(true);setError('');
  try{await axios.post(`${API_BASE_URL}/auth/password`,{currentPassword,newPassword});
   setAuthorization('');setUser(null);setOperations(false);setChanging(false);setCurrentPassword('');setNewPassword('');
  }catch(err){setError(err.response?.data?.error || 'Password change failed. Check your current password.');}
  finally{setBusy(false);}
 }
 async function login(e){
  e.preventDefault();setBusy(true);setError('');
  try {
   setAuthorization(`Basic ${btoa(unescape(encodeURIComponent(`${username}:${password}`)))}`);
   const {data}=await axios.get(`${API_BASE_URL}/auth/me`);
   setUser(data);setPassword('');
  }catch{setAuthorization('');setError('Sign in failed. Check your credentials and backend connection.');}
  finally{setBusy(false);}
 }
 function signOut(){setAuthorization('');setUser(null);setOperations(false);setManaging(false);setChanging(false);setError('');setCurrentPassword('');setNewPassword('');}
 if(!user)return <main className="auth-screen"><section className="auth-card">
 <span className="auth-eyebrow">AEROSIM · FLIGHT OPERATIONS</span><h1>Welcome back</h1><p>Sign in to your flight operations workspace.</p><form onSubmit={login}>
 <label>Username <input required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)}/></label>
 <label>Password <input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
 {error&&<p role="alert" className="auth-error">{error}</p>}<button className="auth-primary" disabled={busy}>{busy?'Signing in…':'Sign in to workspace'}</button></form>
 <p className="auth-footnote">Authorized personnel access</p></section></main>;
 return <div className="authenticated-workspace">
 <header className="auth-toolbar"><span className="auth-workspace-label">AeroSim <small>Operations workspace</small></span><nav aria-label="Account actions">
 {user.roles.includes('ROLE_ADMIN')&&<button aria-expanded={managing} onClick={()=>{setManaging(v=>!v);setChanging(false);setOperations(false);}}>Manage users</button>}
 {user.roles.includes('ROLE_ADMIN')&&<button aria-expanded={operations} onClick={()=>{setOperations(v=>!v);setManaging(false);setChanging(false);}}>Operations</button>}
 <button aria-expanded={changing} onClick={()=>{setChanging(v=>!v);setManaging(false);setOperations(false);setError('');}}>Change password</button>
 <span className="auth-identity">{user.username}<small>{user.roles.filter(r=>['ROLE_ADMIN','ROLE_OPERATOR','ROLE_VIEWER'].includes(r)).map(r=>r.replace('ROLE_','')).join(', ')}</small></span>
 <button onClick={signOut}>Sign out</button></nav></header>
 {(managing||changing||operations)&&<aside className="account-panel" aria-label="Account settings">
 <button className="account-close" onClick={()=>{setManaging(false);setChanging(false);setOperations(false);setCurrentPassword('');setNewPassword('');}}>Close settings</button>
 {operations&&user.roles.includes('ROLE_ADMIN')&&<OperationsPanel/>}
 {managing&&user.roles.includes('ROLE_ADMIN')&&<UserManagement username={user.username}/>}
 {changing&&<form className="auth-password-form" onSubmit={changePassword}><h2>Change password</h2><p>Use at least 12 characters, up to 72 UTF-8 bytes.</p>
 <label>Current password <input required type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/></label>
 <label>New password <input required minLength={12} maxLength={128} type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label>
 {error&&<p role="alert" className="auth-error">{error}</p>}<button className="auth-primary" disabled={busy}>Save password and sign out</button></form>}
 </aside>}{children}</div>;
}





