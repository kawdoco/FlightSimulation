// Coordinated demo turn: bank creates a turn at flying speed, gyro yaw is display-only.
export function advanceBankHeading(heading, speed, roll, elapsedSeconds) {
 const current = Number.isFinite(heading) ? heading : 0;
 if(!Number.isFinite(speed)||speed<=120||!Number.isFinite(roll)||!Number.isFinite(elapsedSeconds)||elapsedSeconds<=0||elapsedSeconds>1)return current;
 const bank=Math.abs(roll)<2?0:Math.max(-40,Math.min(40,roll));
 const radiansPerSecond=9.81*Math.tan(bank*Math.PI/180)/(speed/3.6);
 const degreesPerSecond=Math.max(-20,Math.min(20,radiansPerSecond*180/Math.PI));
 return ((current+degreesPerSecond*elapsedSeconds)%360+360)%360;
}
