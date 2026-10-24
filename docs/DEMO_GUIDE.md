# EAD demo walkthrough

## Preparation

Use a known demo database and back it up before presenting. Keep credentials out of slides/screenshots. Start only one backend instance. Controller firmware belongs on the controller board, plane firmware on the sensor/servo board; verify port identities rather than assuming numbers.

For the current hardware arrangement, controller COM3 feeds the backend and plane COM7 is used only for firmware/diagnostics. Port numbers may change when USB devices are reconnected.

From the repository root, after stopping any existing backend:

```powershell
.\scripts\start-hardware.ps1 -Port COM3 -FlightId 1
```

Run the frontend separately from frontend with npm run dev. Close Controller Serial Monitor before starting ingestion. If a backend is already receiving telemetry, leave it running instead of starting another instance. Keep the plane level and joystick centered during calibration. Use a clear area for servo movement.

## Presentation sequence (approximately 10 minutes)

| Stage | Demonstration | Acceptance observation |
| --- | --- | --- |
| Sign-in | Sign in as admin | Workspace loads; no password appears in user/audit responses |
| Aircraft | Create a demo aircraft and inspect its details | Validation works; registration is unique |
| Flights | Schedule a flight for an available aircraft, start and complete it | Lifecycle and aircraft availability change together |
| Maintenance | Create a work order, start work and complete it | OPEN -> IN_PROGRESS -> COMPLETED; completion time recorded |
| Roles | Show a pre-created viewer account in a separate browser session | Admin controls are hidden and write APIs deny access |
| IoT | Show received live telemetry; tilt physical plane with joystick centered | Pitch/roll changes reach the simulator |
| Flight | Raise throttle above 40 percent, exceed 120 km/h, then pitch up | Scene moves forward and virtual altitude increases |
| Turning/reset | Bank at flying speed; use Restart aircraft | Bank changes direction; reset returns to runway without logout |
| Reports | Open a recorded flight report and download CSV | Full-flight summary, paginated history and CSV work |
| Operations | Refresh readiness and inspect audit trail | Database status and actor/action/target visible |

Use the configured telemetry flight (default ID 1) for IoT recording; creating another flight does not automatically retarget the hardware stream. Raw sensor altitude in telemetry/history differs from locally simulated climb altitude. The chase camera follows the aircraft: use moving scenery/HUD to demonstrate translation.

## Recovery checks before the presentation

- Disconnect/reconnect the controller USB and verify serial reconnect. Confirm stale indication after ten seconds without samples. Record this as pending until actually observed.
- Avoid browser refresh as an aircraft reset: credentials are memory-only, so refresh requires login. Use Restart aircraft.
- If startup fails, inspect the first Caused by message. Do not delete database files or start duplicate backends.
- If heading drifts in raw readings, explain that simulator turning uses bank; MPU6050 is not an absolute compass.
- If physical tilt is absent but joystick works, verify the correct combined sensor/control plane firmware is flashed.
- Ultrasonic no-echo was observed previously; do not claim distance-sensor acceptance until wiring and echo behavior pass a live test.

## Demo fallback and evidence

If hardware is unavailable, use Keyboard mode and explicitly label the demonstration as simulated input. Do not present mocked browser tests as a live IoT test. Keep test summaries, firmware revisions and the release commit with the demo submission.

Current verification and remaining production gates are in [Release acceptance](RELEASE_ACCEPTANCE.md). Setup details are in [Operations](OPERATIONS.md), and the architecture explanation is in [Architecture](ARCHITECTURE.md).
