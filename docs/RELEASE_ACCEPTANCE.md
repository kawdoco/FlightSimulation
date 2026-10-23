# Release acceptance status

This file replaces no prior findings: it records what the seven release workstreams actually achieved.

1. Migrations: Flyway V1 added for all current entities. Production uses migrations + Hibernate validate, automatic baseline and clean disabled. H2 PostgreSQL-mode migration/schema/repeat-run test passed. Existing local data is left on Hibernate update with Flyway disabled. Existing PostgreSQL schemas MUST be compared and backed up before a deliberate baseline; never enable baseline-on-migrate blindly.
2. Security: per-source-IP failure throttle added (10 failed authenticated API calls/minute, then 429); bounded to 10,000 tracked sources. No forwarded headers trusted. Single-instance only; behind a proxy clients may share an IP, so production edge throttling is still required. HTTPS gateway configuration supplied. No certificate/domain provisioning performed.
3. PostgreSQL: CI job added using an isolated PostgreSQL service for migration and concurrent-flight tests. Docker and psql were unavailable locally. PostgreSQL verification is pending a successful CI run.
4. Browser: Playwright tests authored for mocked admin sign-in/operations/sign-out and viewer control visibility. These are UI tests with mocked REST, not live full-stack acceptance. Browser installation/execution belongs in CI; tests have not yet run locally.
5. Hardware: manual acceptance steps below; physical hardware is not accessible through current tools. No physical verification claimed.
6. Performance/recovery: deterministic async capacity and batch-export tests already pass; deployment backup helper added. Throughput benchmarks and a real restore drill remain pending.
7. Deployment: container, PostgreSQL Compose and optional Caddy HTTPS gateway supplied. No staging host, domain or deployment credentials are connected. No release is published.

## Hardware acceptance
Enable SERIAL_ENABLED and select the real COM port. Create/select the configured flight. Verify joystick axes, throttle and altitude units; disconnect USB, observe stale telemetry after 10 seconds, reconnect and verify recovery. Test missing/invalid sensors, oversized/invalid packets and backend shutdown. Capture pass/fail evidence for each device/firmware revision. This is simulator validation, not aircraft flight certification.

## Staging procedure
Run backend verify and frontend tests/build. Build frontend with VITE_BACKEND_URL set to the HTTPS public origin, and FRONTEND_URL set to the same origin. Set unique DB_PASSWORD and initial APP_ADMIN_PASSWORD in the invoking environment. Set PUBLIC_DOMAIN to a domain pointing at the staging host. Build the backend JAR before Docker image build.

From deploy: docker compose -f compose.yaml -f https.compose.yaml up --build -d. This is an operator command, not executed by the agent. Ports 80/443 must be available for Caddy certificate provisioning. Review the source-IP throttle/proxy limitation before public exposure. The database is not host-published; backend binding is loopback only. Do not reuse CI credentials.

Before every upgrade take a backup with deploy/backup.ps1. Restore only into a separate disposable database first using pg_restore --exit-on-error, compare row counts, verify admin login and telemetry reports, and document results. No automated restore is run against existing user data. Production promotion requires successful PostgreSQL CI, live browser checks, hardware checks, load targets and restore evidence.

Restore tooling: deploy/restore-drill.ps1 takes a backup filename, creates a new timestamped database, restores with --exit-on-error and checks core table counts. It never deletes existing databases. The drill database is retained for inspection. Script has not been executed because Docker is unavailable.

Load tooling: scripts/load-smoke.mjs performs 50 authenticated, read-only readiness requests at concurrency five and prints failure count/p50/p95. Supply LOAD_TEST_BASE_URL, LOAD_TEST_USERNAME and LOAD_TEST_PASSWORD via the process environment. It rejects plaintext remote targets. This probe does not model telemetry ingestion, browser rendering or realistic production load, and has not been executed against staging.

## Final local verification for this increment
- Backend Maven verify/package: 86 tests passed, zero failures/errors.
- Frontend Node tests: 8 passed; production build passed (large simulator chunk warning remains).
- npm audit after compatible Vite patch update: zero reported vulnerabilities.
- Four Playwright specs parse/list successfully; browser execution is not claimed (no connected browser surface).
- Backup/restore/local verification PowerShell scripts parse successfully.
- PostgreSQL service CI and browser CI are configured but have not been run remotely.
- ESP32 tests explicitly deferred at the user's request because hardware is disconnected.

The seven workstreams have code/configuration/procedures prepared, but production acceptance is NOT complete. Required external inputs are a disposable PostgreSQL runtime, a connected/test browser runtime and staging domain/host access. Deployment, real restore, benchmark and live end-to-end evidence cannot be manufactured from passing unit tests.
