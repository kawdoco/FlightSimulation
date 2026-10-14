// Simple keyboard-demo dynamics: throttle controls a target speed in km/h.
export function advanceSpeed(speed, throttle, elapsedSeconds) {
  const currentSpeed = Number.isFinite(speed) ? Math.max(0, speed) : 0;
  const targetSpeed = Math.min(100, Math.max(0, throttle)) * 3;
  const difference = targetSpeed - currentSpeed;
  const rate = difference > 0 ? 25 : 15;
  const step = rate * Math.min(0.25, Math.max(0, elapsedSeconds));
  return currentSpeed + Math.sign(difference) * Math.min(Math.abs(difference), step);
}

export const FEET_PER_WORLD_UNIT = 3.28084;

// Share altitude between the instrument readout and the aircraft's 3D position.
export function advanceAltitude(altitude, speed, pitch, elapsedSeconds) {
  const currentAltitude = Number.isFinite(altitude) ? Math.max(0, altitude) : 0;
  const climbPitch = Number.isFinite(pitch) && Math.abs(pitch) >= 1
    ? Math.min(30, Math.max(-30, pitch))
    : 0;
  if (speed <= 120 && currentAltitude === 0) return 0;
  const delta = Math.min(.25, Math.max(0, elapsedSeconds));
  return Math.max(0, currentAltitude + climbPitch * .5 * delta * FEET_PER_WORLD_UNIT);
}
