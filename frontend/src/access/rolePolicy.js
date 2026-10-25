export function resolveRole(roles = []) {
 return ['ADMIN','OPERATOR','VIEWER'].find(role => roles.includes(`ROLE_${role}`)) ?? null;
}
export const roleLabels = {ADMIN:'Administrator',OPERATOR:'Operator',VIEWER:'Viewer'};
export function permissions(role){return {isAdmin:role==='ADMIN',canOperate:role==='ADMIN'||role==='OPERATOR',canDelete:role==='ADMIN'};}
const shared=[['/aircraft','Aircraft','aircraft'],['/flights','Flights','flights'],['/telemetry','Live telemetry','telemetry'],['/history','History & reports','report']];
export function navigation(role){
 if(!role)return [];
 if(role==='ADMIN')return [['/','System overview','dashboard'],['/users','Users','dashboard'],...shared.slice(0,2),['/simulator','Simulator','simulator'],['/maintenance','Maintenance','maintenance'],...shared.slice(2),['/iot-devices','IoT monitoring','chip'],['/operations','Audit & operations','maintenance']];
 if(role==='OPERATOR')return [['/','Flight operations','dashboard'],['/simulator','Simulator','simulator'],shared[1],shared[2],['/iot-devices','IoT monitoring','chip'],['/maintenance','Maintenance','maintenance'],shared[3],shared[0]];
 return [['/','Monitoring overview','dashboard'],shared[2],...shared.slice(0,2),shared[3],['/maintenance','Maintenance status','maintenance'],['/iot-devices','IoT monitoring','chip']];
}
export function routeAllowed(role,path){
 if(!role)return false;
 if(['/users','/operations'].includes(path))return role==='ADMIN';
 if(path==='/simulator')return permissions(role).canOperate;
 return true;
}
