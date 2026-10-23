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
- /api/telemetry/{flightId}/history: zero-based page, size 1–200 (default 100); content/page/size/hasNext. Concurrent inserts can shift offset pages.
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
