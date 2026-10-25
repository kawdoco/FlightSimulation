# Operations

## Local setup

Use Java 21, Node.js 22 and npm. Maven is provided by the wrapper. From the repository root:

```powershell
$env:APP_ADMIN_PASSWORD='<choose-a-unique-password>'
.\start.bat
```

First startup creates admin only if missing. Passwords require at least 12 Unicode characters and at most 72 UTF-8 bytes. Existing account passwords are not reset by environment changes. Use Change password in the account bar. Local data lives in backend/data; back it up with the backend stopped before upgrading.

Frontend runs on 5173; backend on 8081. Stop the old process with Ctrl+C before starting a replacement. Do not blindly terminate an unidentified process occupying a port.

## Configuration

| Variable | Purpose |
| --- | --- |
| APP_ADMIN_PASSWORD | Initial admin provisioning only |
| APP_PROFILE | local by default; prod enables PostgreSQL migrations/validation |
| DB_URL, DB_USERNAME, DB_PASSWORD | Production database connection |
| FRONTEND_URL | Allowed frontend origin |
| VITE_BACKEND_URL | Public backend origin, embedded during frontend build |
| SERIAL_ENABLED | Enable serial input; false by default |
| FLIGHTSIMULATION_SERIAL_PORT | Actual COM port; close Arduino Serial Monitor first |
| PUBLIC_DOMAIN | Domain used by optional Caddy HTTPS gateway |

The local profile overrides database settings with H2. Select prod explicitly for PostgreSQL. Never commit real credentials. Remote HTTP Basic traffic requires HTTPS/WSS.

## Verification

```powershell
.\scripts\verify.ps1
```

This installs locked frontend dependencies, runs backend verification/package, frontend unit tests and production build. From frontend, run `npm run test:e2e` after installing the Playwright Chromium runtime. Browser tests mock REST responses; they do not replace live full-stack verification.

GitHub Actions defines backend, frontend and PostgreSQL jobs. Require the appropriate checks in branch protection. Failed browser runs upload traces/screenshots; backend test reports are also retained for seven days. See [Release acceptance](RELEASE_ACCEPTANCE.md) for actual evidence rather than assuming a configured job passed.

## API contracts

- Telemetry GET /api/telemetry/{flightId}: latest 200 samples; X-Result-Limit and Link advertise the cap/alternate history route.
- /api/telemetry/{flightId}/history: zero-based page, size 1�200 (default 100); content/page/size/hasNext. Concurrent inserts can shift offset pages.
- /summary: full-flight database aggregates. /export: UTF-8 CSV, 500-row descending-ID batches, escaped metadata and formula protection. Initial maximum ID excludes later inserts; concurrent updates/deletes are not snapshot-isolated. The browser still buffers a Blob.
- User, maintenance and audit lists: content/page/size/totalElements/totalPages/first/last, 50 records per page.
- Validation errors return 400; missing resources 404; state/concurrency/integrity conflicts 409. Authentication/permission failures return safe JSON 401/403 without browser Basic challenge dialogs.

## Monitoring and audit

The admin Operations panel exposes readiness and audit views on demand; use Refresh for a new check.

GET /api/operations/readiness requires ADMIN. It checks database connection validity, returns UP/200 or DOWN/503 and is not cached. Validation allows two seconds after acquiring a connection; pool acquisition may take another 30 seconds. Database-backed authentication may fail before the handler when the database is unavailable. This is not an ESP32 health probe.

GET /api/operations/audit?page=0 requires ADMIN. Account bootstrap/creation/access/password changes, flight lifecycle actions and maintenance transitions are recorded with actor, action, target and UTC timestamp. Records share the business transaction; rollback removes success entries. No password values/hashes, telemetry samples or maintenance descriptions are copied. No edit/delete API exists; database administrators can still modify records. Retention, failed-login auditing and tamper-evident archival remain outstanding.

Responses carry server-generated X-Request-ID values, also propagated to synchronous/async request logs. Include that ID when reporting errors; do not include passwords or Authorization headers. This is local request correlation, not distributed tracing.

## Capacity, security and recovery limits

Async HTTP workers use two core/eight maximum threads and 32 queued tasks. Capacity rejection before response commitment returns 503 with Retry-After: 5. Async timeout is four minutes; frontend CSV timeout is five minutes, other API calls 30 seconds. Failures after response commitment may leave a partial download. Tune these limits against real workloads.

Authentication failure throttling tracks source IPs in the local process: ten failed Basic-authenticated API calls within a minute trigger 429; at most 10,000 sources are retained. Forwarded headers are not trusted. Behind a proxy clients may share an IP; configure edge throttling before exposure. Socket revocation is also local-process only.

## Hardware

Enable serial input and set the real COM port. The reader retries unavailable ports every three seconds and rejects frames over 4096 characters or invalid/non-finite values. Telemetry pages mark retained data stale after ten seconds without a packet. Freshness does not establish device authenticity. Physical acceptance is tracked in [Release acceptance](RELEASE_ACCEPTANCE.md).

## Staging deployment

Build backend JAR and frontend assets first. Set VITE_BACKEND_URL and FRONTEND_URL to the HTTPS public origin; set DB_PASSWORD, initial APP_ADMIN_PASSWORD and PUBLIC_DOMAIN through the invoking environment.

From deploy:

```powershell
docker compose -f compose.yaml -f https.compose.yaml up --build -d
```

The database is not host-published; the backend binds loopback. Ports 80/443 and correct DNS are needed for Caddy certificate provisioning. These are operator instructions, not evidence that deployment has occurred.

Production runs Flyway V1 then Hibernate validate, with automatic baseline and clean disabled. Back up and compare existing schemas before deliberately baselining. Do not enable automatic baseline to bypass migration errors. Local Flyway is disabled to preserve existing development databases.

## Backup, restore and load checks

Use deploy/backup.ps1 with a new destination filename. Use deploy/restore-drill.ps1 with that backup to restore into a new timestamped database; it retains the drill database and never overwrites existing databases. Verify counts, admin login and reports before declaring recovery successful.

scripts/load-smoke.mjs runs 50 read-only readiness requests at concurrency five. Supply LOAD_TEST_BASE_URL, LOAD_TEST_USERNAME and LOAD_TEST_PASSWORD via environment variables. It rejects plaintext remote targets and reports failure count/p50/p95. This is not a representative telemetry/load benchmark.

Completed and pending verification belongs in [Release acceptance](RELEASE_ACCEPTANCE.md).

## Joystick simulator climb mode

Plane firmware combines mounted MPU6050 attitude with joystick commands for simulator pitch/roll. Pitch uses -filteredRoll plus joystick pitch; bank uses filteredPitch plus joystick roll to correct left/right direction. Both outputs are clamped to +/-45 degrees. Combined telemetry is simulator attitude, not a pure sensor measurement. Re-upload plane_esp32.ino to activate this behavior; controller firmware is unchanged.

In IoT mode, the simulator integrates virtual altitude from speed and commanded pitch. Build speed above 120 km/h (throttle above 40 percent), then command nose-up to take off. Centering maintains altitude and nose-down descends to a ground floor. The simulator HUD/panel show virtual altitude; raw telemetry/history retain ultrasonic altitude. This is demo flight dynamics, not a physical aircraft model. Integration pauses after ten seconds without updated inputs. Virtual altitude is local to the simulator view and resets when it remounts or re-enters IoT mode. Frontend tests/build pass; firmware upload and physical joystick direction/climb verification remain pending.

For an explicit hardware backend launch from the repository root, stop any existing backend then run .\scripts\start-hardware.ps1 -Port COM3 -FlightId 1. This supplies serial settings as command-line properties so an unset SERIAL_ENABLED variable cannot silently disable ingestion. It starts only the backend; keep the frontend running. Do not open the controller serial monitor at the same time.


## Integrated simulator control corrections

Forward travel now converts km/h to meters/second consistently with the scene scale. Virtual climb uses speed times sin(pitch), converts meters to feet and prevents ground penetration; takeoff still requires more than 120 km/h. This remains simplified demo dynamics (no aerodynamic stall/drag model). Zero speed cannot create vertical climb from pitch alone. Missing telemetry pauses virtual integration and forward motion after ten seconds. Restart aircraft resets position, virtual altitude and heading reference without signing out; live hardware controls are not physically reset.

Simulator heading holds while parked and ignores rates at/below two degrees/second when moving; large changes are capped and reconnect gaps rebase. Plane firmware additionally applies a 1.5-degree/second gyro deadband and caps integration time. Slow intentional yaw may also be suppressed. Plane pitch/roll combines mounted MPU6050 axes and joystick commands, including corrected simulator bank direction. Flash the updated plane firmware to the plane board only; controller firmware is unchanged. Compilation/tests are not a substitute for checking actual sensor orientation and servo power/wiring. No plane-board upload is claimed in this correction pass.

Heading control update: the simulator now uses coordinated bank turns above 120 km/h rather than integrating MPU6050 yaw into its flight direction. Level bank flies straight; small roll inputs under two degrees are ignored, turn rate is capped at 20 degrees/second, and parked/taxiing bank does not spin the aircraft. Raw gyro heading remains visible in telemetry. This supersedes the earlier simulator gyro-heading filter description. Throttle produces forward motion; pitch produces climb/descent, and roll produces turns at flying speed. This is simplified simulator control and requires checking physical axis directions after flashing the plane firmware.

## Supabase PostgreSQL

Run .\backend\run-supabase.ps1 from the repository root (add -Hardware -Port COM3 -FlightId 1 for ESP32). It asks for the Session pooler JDBC URL on port 5432 with sslmode=require or verify-full, database username and a hidden database-password prompt. DB_URL/DB_USERNAME may be supplied through environment variables; no project credentials are embedded in the script. Stop the existing backend first. No Supabase API/service-role key is required or sent to React.

The supabase profile imports production configuration, runs Flyway and validates Hibernate mappings in a dedicated flightsimulation schema. Existing public tables are neither adopted nor copied. Do not expose the flightsimulation schema through the Supabase Data API for this backend-only design. Application login/roles remain Spring-managed; Supabase Auth is not introduced. The normal local/H2 startup remains available until live cutover is verified.

Existing H2 records are not automatically transferred. Back up the stopped H2 database before planning migration. The new schema can bootstrap a new admin but does not inherit old users, flights or telemetry. Choose fresh setup versus a separately reviewed data migration before cutover. Supabase connection and live PostgreSQL verification remain blocked until connection settings are provided. H2 profile integration testing does not prove cloud connectivity.

Connection reference: https://supabase.com/docs/guides/getting-started/quickstarts/spring-boot

### Preserve H2 records during Supabase cutover

The operator migration tool is scripts/migrate-to-supabase.ps1. Stop the backend first. It makes a hash-verified offline H2 backup under ignored backups/, reads source tables, and obtains the database password using a hidden prompt. Without -Apply it only checks connectivity/source counts and makes no destination changes. With -Apply, Flyway creates/validates the isolated flightsimulation schema, then all application tables are imported in one data transaction. Existing target rows cause refusal; nothing is overwritten. Original IDs, user password hashes, relationships and audit timestamps are retained; PostgreSQL identity sequences are advanced. Do not run the Supabase web application before importing: a bootstrapped admin would make the destination nonempty.

From the repository root:

```powershell
.\scripts\migrate-to-supabase.ps1
.\scripts\migrate-to-supabase.ps1 -Apply
.\backend\run-supabase.ps1 -Hardware -Port COM3 -FlightId 1
```

Use the existing admin login after import. Source H2 data remains available for rollback; never run both applications writing independently after cutover. Source counts before migration preparation were aircraft=1, flights=1, telemetry=87559, alerts=0, iot_devices=0, maintenance_records=0, application_users=1, audit_records=2. A verified offline backup was created; the user subsequently supplied successful cloud import/commit output (see Release acceptance). Migration unit testing covers copying and refusal of nonempty targets on H2; actual PostgreSQL import/identity reset must be checked after execution. Keep the backup protected because it contains password hashes and application data.

## Live hardware versus cloud recording

Live serial packets now publish to WebSocket before persistence. Supabase recording runs on a separate single worker with one pending sample. Under database backpressure, an older pending sample is replaced by the latest sample; historical hardware recording is therefore sampled and is NOT a lossless packet archive. Live control latency no longer waits for database round trips. REST telemetry writes retain save-before-broadcast semantics. Storage failures do not halt the live stream. Restart the backend to activate this change; do not rerun the H2 migration. Durable high-rate capture would require a separate bounded disk-backed ingestion design.

IoT mode now uses App's actual packet-received timestamp for stale detection, rather than treating every component rerender as a new hardware sample. The simulator itself displays freshness and taxi/takeoff/pitch guidance. Refreshing/navigation cannot make an old packet fresh. Backend changes require restarting the Supabase launcher; frontend edits alone cannot update a running JVM. Existing user/password credentials are not read from another running process by tooling.

## Hardware reliability updates

Use `.\start.bat` for a local demo with serial enabled and automatic controller discovery, or `.\scripts\start-hardware.ps1` to start just the hardware backend. `-Port COM7` still overrides discovery. AUTO scans available serial ports at 115200 and accepts a port only after validating controller JSON; plane diagnostic text is ignored. Close Arduino Serial Monitor. Serial disconnects trigger another scan. Set `SERIAL_ENABLED=false` for a keyboard-only startup.

The Hardware flight selector is the single runtime destination for live subscription and hardware recording. Admins/operators can select an existing flight; viewers can monitor only. The selection applies to the whole controller session and starts from the configured flight ID after a backend restart. The frontend reads this destination from `/api/hardware`; `VITE_TELEMETRY_FLIGHT_ID` is no longer used. Load-balanced deployments route all `/api/hardware*` traffic to serial owner A.

Upload both updated sketches to enable nullable `altitudeValid`, `imuValid`, and `commandFresh` flags. Older packets remain accepted but sensor health is shown as unknown. No-echo detection/ground calibration and Wi-Fi credentials were not changed. Missing MPU6050 no longer blocks networking: joystick controls remain available, tilt contribution is neutralized and I2C discovery retries every five seconds. Startup calibration runs only when the sensor is initially present; recovery retains the last calibration. Check physical orientation after recovery.

Hardware recording uses a local disk spool (`flightsimulation.recording.directory`, default `./data/hardware-spool`, relative to the backend working directory). Every accepted sample is fsynced before queuing and retained until its database write succeeds. A stable UUID prevents duplicates if a committed sample is replayed after restart. Database outages retain samples and expose backlog/error status in the UI. The default bound is 100,000 pending samples (`flightsimulation.recording.max-pending`); a full/unwritable disk or full spool is reported explicitly and further samples cannot be recorded. This does not guarantee capture of packets lost before reaching the backend. Do not share a spool directory across backend processes or different databases. Back up pending spool files along with the database; do not delete them to clear errors. Docker Compose persists `/app/data` in a named volume.

Flyway V2 adds the nullable ingestion key and sensor-health columns. Local H2 uses Hibernate update; PostgreSQL/prod uses Flyway before schema validation. Snapshot the target database before deployment; no existing cloud database is migrated by editing this repository. CSV adds `altitudeValid`, `imuValid`, and `commandFresh` columns (blank means unknown). Reports retain raw sensor altitude, and simulator HUD/cards explicitly label simulated altitude.
