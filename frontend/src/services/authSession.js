import axios from 'axios';
import { API_BASE_URL } from './endpoints';
import { shouldExpireSession } from './sessionPolicy';
let authorization = '';
const listeners = new Set();
export const setAuthorization = value => { authorization = value; };
export const getAuthorization = () => authorization;
export const onSessionExpired = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export function expireSession(sentAuthorization) {
 if(!shouldExpireSession(401,sentAuthorization,authorization)) return;
 authorization='';listeners.forEach(listener=>listener());
}
axios.interceptors.request.use(config => {
 if((config.url || '').startsWith(`${API_BASE_URL}/`)) {
  if(authorization) config.headers.Authorization=authorization;
  if(!config.timeout) config.timeout=30000;
 }
 return config;
});
axios.interceptors.response.use(response=>response,error=>{
 if((error.config?.url || '').startsWith(`${API_BASE_URL}/`) && error.response?.status===401) {
  expireSession(error.config?.headers?.Authorization);
 }
 return Promise.reject(error);
});
