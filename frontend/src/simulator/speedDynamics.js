// Simple keyboard-demo dynamics: throttle controls a target speed in km/h.
export function advanceSpeed(speed, throttle, elapsedSeconds) {
  const currentSpeed = Number.isFinite(speed) ? Math.max(0, speed) : 0;
  const targetSpeed = Math.min(100, Math.max(0, throttle)) * 3;
  const difference = targetSpeed - currentSpeed;
  const rate = difference > 0 ? 25 : 15;
  const step = rate * Math.min(0.25, Math.max(0, elapsedSeconds));
  return currentSpeed + Math.sign(difference) * Math.min(Math.abs(difference), step);
}
