// Demo dynamics; speed is km/h, altitude feet, scene distances meters.
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
export function advanceSpeed(speed, throttle, elapsedSeconds) {
 const current=Math.max(0,finite(speed));
 const target=Math.min(100,Math.max(0,finite(throttle)))*3;
 const difference=target-current;
 const step=(difference>0?25:15)*Math.min(.25,Math.max(0,finite(elapsedSeconds)));
 return current+Math.sign(difference)*Math.min(Math.abs(difference),step);
}
export const FEET_PER_WORLD_UNIT=3.28084;
export function advanceAltitude(altitude,speed,pitch,elapsedSeconds){
 const height=Math.max(0,finite(altitude));
 const airspeed=Math.max(0,finite(speed));
 const angle=Math.abs(finite(pitch))>=1?Math.max(-30,Math.min(30,pitch)):0;
 const dt=Math.min(.25,Math.max(0,finite(elapsedSeconds)));
 if(height===0&&airspeed<=120)return 0;
 // A parked aircraft cannot climb by changing pitch alone.
 const verticalSpeed=airspeed<=1?0:(airspeed/3.6)*Math.sin(angle*Math.PI/180);
 return Math.max(0,height+verticalSpeed*dt*FEET_PER_WORLD_UNIT);
}
export function forwardDistance(speed,elapsedSeconds){
 return Math.max(0,finite(speed))/3.6*Math.min(.1,Math.max(0,finite(elapsedSeconds)));
}
