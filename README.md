# FlightSimulation

AeroSim is an EAD project combining aircraft and flight management, a React/Three.js simulator, real-time telemetry and ESP32 controls.

## Quick start

Use Java 21 and Node.js 22 with npm. From the project root:

```powershell
$env:APP_ADMIN_PASSWORD='<choose-a-unique-password>'
.\start.bat
```

The initial admin password requires at least 12 Unicode characters and at most 72 UTF-8 bytes. Sign in as `admin`. Existing accounts retain their saved passwords; use Change password in the UI afterward. Serial hardware is optional and disabled by default.

Frontend: http://localhost:5173. Backend: http://localhost:8081. Stop an existing server before starting another on the same port.

## Implemented scope

- Aircraft and flight management with lifecycle rules and optimistic locking.
- Persistent users, role permissions, maintenance work orders and audit records.
- Telemetry monitoring, paginated history, database summaries and streamed CSV export.
- ESP32 serial ingestion, packet validation, retry handling and stale-data indicators.
- Request tracing, readiness checks, CI and staging/backup tooling.

These features do not establish production readiness. See the release acceptance evidence before deployment.

## Documentation

| Document | Purpose |
| --- | --- |
| [Architecture](docs/ARCHITECTURE.md) | MVC layers, data flow, security and API contracts |
| [Operations](docs/OPERATIONS.md) | Setup, verification, deployment, backup and troubleshooting |
| [Demo walkthrough](docs/DEMO_GUIDE.md) | Presentation sequence, preflight checks and fallback |
| [Release acceptance](docs/RELEASE_ACCEPTANCE.md) | Verified evidence and outstanding release gates |
| [Requirements](docs/requirements/README.md) | Feature requirements and hardware integration plan |
| [Historical notes](docs/archive/README.md) | Earlier reviews and incremental implementation history |

## Verification

```powershell
.\scripts\verify.ps1
```

This runs backend verification and frontend dependency installation, unit tests and build. Browser tests and PostgreSQL checks are configured separately in GitHub Actions. Requirements describe intended behavior; test results and deployment status belong in release acceptance.
