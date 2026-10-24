import {createContext,useContext} from 'react';
import {permissions,resolveRole,roleLabels} from './rolePolicy';
export const RoleContext=createContext(null);
export function useAccess(){const user=useContext(RoleContext);const role=resolveRole(user?.roles);return {user,role,label:roleLabels[role]??'No workspace role',...permissions(role)};}
