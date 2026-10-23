# Enterprise readiness review

Reviewed 2026-10-23. Scope: repository structure, backend configuration/services/entities/controllers, frontend API integration and feature completeness, serial ingestion and firmware data flow. This is a source review and build baseline, not a penetration test or hardware certification.

## Verdict
The project is a working prototype, not ready for enterprise production deployment. README feature claims exceed the implementation.

## Priority findings

1. CRITICAL — No access control. SecurityConfig permits every request; no implemented JWT/user/role flow was found. Untrusted callers can modify aircraft, flights and telemetry. Implement an identity provider, server-side roles and device identities; test denied access and ownership rules before deployment.
2. HIGH — Default data loss. application.properties selects local, and application-local.properties uses in-memory H2 with create-drop. Configure an explicit persistent production database, versioned migrations, backup and restore checks. Environment DB variables in the base file are overridden by local profile settings.
3. HIGH — WebSocket accepts every origin. WebSocketConfig uses wildcard allowed origin patterns and has no subscription authorization. Restrict origins and authorize connections/subscriptions as part of identity implementation.
4. HIGH — Concurrent flight transitions are not protected by entity versions or explicit locks. FlightService.startFlight reads availability then saves; concurrent transactions may start two flights for one aircraft. Add transaction-safe locking and concurrent integration tests.
5. HIGH — Controllers bind persistence entities directly. Create requests can supply IDs and other server-managed fields. Introduce operation-specific request DTOs and enforce server-owned identifiers/timestamps/statuses. IoTDeviceController registration also lacks @Valid.
6. HIGH — Telemetry reads are unbounded. TelemetryService loads all flight samples for reports, summaries and CSV exports. Add pagination/time windows, database aggregates, streaming exports, retention and an index verified against query plans.
7. MEDIUM — Missing telemetry flights throw generic RuntimeException, producing server errors instead of 404. IllegalArgumentException from history/alert validation also lacks an advice handler. Normalize error responses and add controller contract tests.
8. MEDIUM — Frontend service URLs hardcode localhost and insecure HTTP/WS. Configure API/WebSocket endpoints per environment and support HTTPS/WSS. Centralize timeout and error handling.
9. MEDIUM — Telemetry service uses a global WebSocket client. A second subscriber receives the existing client without registering its callback or flight topic; disconnect affects all consumers. Use a shared subscription registry or component-owned clients and test reconnect/unmount behavior.
10. MEDIUM — Serial reader stops after an I/O exception without reconnecting; readLine has no explicit packet size bound. Add bounded framing, retry/backoff, connection health and dropped-packet metrics.
11. MEDIUM — MaintenancePage is a placeholder. IoTDevicesPage shows received samples rather than persisted device management. README claims authentication, maintenance workflows and other planned features as available. Document actual versus planned capabilities.
12. MEDIUM — CSV metadata is concatenated without CSV escaping or spreadsheet formula neutralization. Escape untrusted flight numbers before export.
13. MEDIUM — Production frontend bundle is 1,348.71 kB (386.28 kB gzip). Split simulator/routes and measure actual loading performance.

## Verification
- backend: ./mvnw.cmd test -q passed (existing two telemetry ingestion tests). Mockito dynamic-agent warnings remain.
- frontend: npm run build passed, with large chunk warning.
- No frontend automated test script is configured.
- Live database integration, authorization, browser workflows, load testing and physical ESP32 behavior were not verified.

## Recommended delivery sequence
1. Identity and roles, device authentication, production configuration, restricted WebSocket access.
2. DTO contracts, database migrations, concurrency protection, consistent API errors and integration tests.
3. Bounded telemetry storage/query/export, reconnect/health monitoring and audit records.
4. Complete maintenance/device workflows, route splitting, accessibility and browser acceptance tests.
5. CI checks, staging deployment, restore drill, operational documentation and measured load/security acceptance criteria.

Production acceptance should require verified anonymous access denial, role enforcement, restart persistence, concurrent flight safety, bounded telemetry queries, reconnect behavior and a tested restore procedure. Passing compilation alone does not establish these properties.
