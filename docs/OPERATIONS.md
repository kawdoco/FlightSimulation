# Verification and local operation

Requirements: Java 21 and Node.js 22 with npm. Maven is downloaded through the committed wrapper; a separate Maven installation is unnecessary.

Run all local checks from the repository root:

```powershell
.\scripts\verify.ps1
```

This installs locked frontend dependencies, runs backend verify (including tests and packaging), and builds frontend assets. GitHub push/PR checks perform equivalent verification. Uploaded test reports are retained for seven days. CI has not been run on GitHub yet; branch protection must be configured in repository settings to require both jobs.

For first local startup, set APP_ADMIN_PASSWORD (12–128 characters) in the terminal used to launch the backend. Existing persisted users retain their password; subsequent changes should use the account UI. Local data is stored under backend/data and must be backed up before upgrades.

```powershell
$env:APP_ADMIN_PASSWORD='<choose-a-unique-password>'
.\start.bat
```

Serial input is disabled by default so the application can start without ESP32 hardware. To enable it before launching, set SERIAL_ENABLED=true and FLIGHTSIMULATION_SERIAL_PORT to your actual COM port. Close Arduino Serial Monitor before starting. Stop each server in its own terminal with Ctrl+C. Do not start a second backend on port 8081.

Production is not yet ready for unattended deployment. The prod profile validates an existing PostgreSQL schema; automated migrations, restore verification, HTTPS termination, rate limits and multi-instance session revocation remain outstanding. CI compilation/tests do not verify physical hardware, browser visuals or production load.

## Telemetry API compatibility change

GET /api/telemetry/{flightId} now returns only the latest 200 samples, ordered by recordedAt then id descending. Its JSON array shape is preserved, but clients must not assume it is the full flight history. X-Result-Limit indicates the cap and Link points to the alternate /history endpoint. Use /history?page=0&size=100 and hasNext for browsing, /summary for full-flight aggregates, and /export for a complete CSV. The bundled report UI already uses pagination. The unbounded repository list query has been removed.

## Readiness monitoring

GET /api/operations/readiness requires ADMIN authentication. A valid database connection returns 200 with status/database UP; an invalid/unavailable connection returns 503 with DOWN. The response is not cached and contains no database URL, credentials or SQL exception details. Connection validation allows two seconds after obtaining a pooled connection; pool acquisition may additionally take up to the configured Hikari connection timeout (30 seconds by default). Configure monitoring timeouts accordingly. This is a database readiness check, not an ESP32 health check or public load-balancer probe. The database must remain available for database-backed admin authentication as well; authentication may fail before this handler when the database is down.

## Account audit trail

ADMIN can read GET /api/operations/audit?page=0 (50 records per page, newest first). Records include actor, action, target username and UTC creation timestamp. Bootstrap, account creation, access updates and successful password changes are recorded in the same transaction as the account change, so failed transactions do not leave success records. Passwords/hashes are not recorded. There is no audit edit/delete API. This is an application audit baseline, not tamper-proof storage: database administrators can modify records. Retention/export policies, failed-login auditing and flight/maintenance auditing remain future work. Production schema provisioning must include audit_records before startup.

Audit coverage now also includes flight creation/update/start/completion/cancellation/deletion and maintenance creation/progress/completion. Targets use flight:<id> and maintenance:<id>. Records share the business transaction: rejected maintenance transitions and rolled-back concurrent flight starts produce no success entries. Tests verify maintenance actor attribution and exactly one committed FLIGHT_STARTED audit entry during a two-flight concurrency conflict. No telemetry samples or maintenance descriptions are copied into audit records.

The admin account bar now includes Operations. This panel displays database readiness, last-check time and a paginated audit trail with refresh controls. Health failures do not hide an otherwise available audit result, and audit failures show an explicit message. Requests are cancelled when the panel closes. This is an on-demand view, not continuous monitoring; refresh to check current state. Frontend policy tests and production build pass; the new panel has not been visually verified in a connected browser.

## Stable paginated responses

Users, maintenance and audit list endpoints now return an explicit PageResponse DTO with content, page, size, totalElements, totalPages, first and last. Page numbers start at zero. Spring-specific pageable/sort metadata is no longer serialized. Existing frontend consumers use content/last and remain compatible. Telemetry history retains its separate content/page/size/hasNext slice contract. Unit tests cover pagination metadata, empty results and immutable content; HTTP tests verify the users wire contract.

Password policy clarification: new user passwords, password changes and initial admin provisioning require at least 12 Unicode characters and at most 72 UTF-8 bytes (BCrypt input limit). Multi-byte characters consume more than one byte. Existing accounts are unchanged. Server validation is authoritative; the HTML input length constraint alone cannot enforce a byte limit.

## Request tracing

Responses include a server-generated X-Request-ID UUID, including authentication failures. API controllers expose this header to the configured frontend origin. During synchronous request handling the same ID appears in the request field of server log entries. Provide this ID with a bug report to correlate logs; never send passwords or Authorization headers. Client-provided request IDs are ignored. MDC context is restored/cleared after handling, including failures. Async streaming worker logs do not yet propagate this context; this is request correlation, not distributed tracing.

## Async HTTP workers

MVC streaming now uses an explicit executor: two core threads, at most eight threads and 32 queued tasks. Async request timeout is four minutes (the browser CSV timeout is five minutes). Saturated submissions are rejected by the executor rather than creating unlimited threads; overload-specific 503 mapping/load testing remains pending. Timeout or disconnect after response headers may leave a partial CSV; retry the export. The executor propagates a captured MDC log context and restores worker context after completion/failure, so streaming logs can carry the original request ID. The full test suite, including async CSV downloads and three context propagation tests, passes. These limits require tuning against actual workload and connection-pool capacity.

Async capacity rejection is now mapped to 503 with Retry-After: 5 and Cache-Control: no-store when the HTTP response has not yet been committed. The error body is sanitized. Tests fill all eight worker slots and 32 queue entries, verify the next task is rejected, and verify the MVC rejection response. This is deterministic capacity testing, not a production throughput benchmark. Failures after streaming starts cannot be converted into a fresh HTTP error response.

Authentication/authorization failures now return application/json with an error field and Cache-Control: no-store. Missing or invalid credentials use the same generic 401 message; permission denials return 403 without revealing internal authority details. Responses intentionally omit the Basic challenge header to avoid browser-native password dialogs; clients should use the application sign-in form and send explicit Authorization headers. Three HTTP tests verify these contracts. The existing request ID filter still adds correlation headers.

Audit security verification now covers anonymous/viewer/operator read denial, admin listing, absence of a delete endpoint, rejected-account-update behavior and real transaction rollback. The rollback test confirms both the new account and its success audit record disappear together after rollback. Five new integration tests pass against isolated H2 storage. Database administrators still retain direct modification privileges; external tamper-evident archival is not implemented.
