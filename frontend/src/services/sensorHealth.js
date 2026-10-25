export function sensorWarnings(telemetry) {
  const warnings = [];
  if (telemetry.altitudeValid === false) warnings.push('Ultrasonic altitude unavailable. The displayed sensor value may be the last valid reading.');
  if (telemetry.imuValid === false) warnings.push('MPU6050 unavailable. Tilt control is disabled; joystick controls remain available.');
  if (telemetry.commandFresh === false) warnings.push('Controller commands lost. Throttle and joystick commands have been reset.');
  if (telemetry.altitudeValid == null || telemetry.imuValid == null || telemetry.commandFresh == null) warnings.push('Sensor health is unknown. Update both ESP32 sketches to report sensor and command status.');
  return warnings;
}
