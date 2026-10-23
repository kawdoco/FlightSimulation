# Release acceptance

Status reviewed: 2026-10-24. The application has substantial implementation and automated coverage; production acceptance remains incomplete.

## Evidence

| Check | Recorded result | Limit |
| --- | --- | --- |
| Local backend verify/package | 86 tests passed at the recorded release increment | Historical run; rerun after code changes |
| Local frontend unit tests/build | 8 tests/build passed | Large simulator chunk warning remains |
| npm audit | Zero reported vulnerabilities after Vite update | Point-in-time result |
| Flyway migration | H2 PostgreSQL-mode schema validation and repeat-run passed | Not PostgreSQL evidence by itself |
| GitHub backend/PostgreSQL jobs | User-provided screenshot showed both passing | No direct CI log/commit inspection performed here |
| GitHub browser job | Screenshot showed 3 passed, maintenance test failed | Selector/loading fix committed and pushed; rerun result not supplied |
| Browser test suite | Four mocked workflow specs authored and listed | Not live full-stack acceptance |
| Backup/restore scripts | PowerShell syntax checked | No real restore performed |

## Release gates

1. **Database migrations:** V1 is implemented. Review any existing production schema and document a safe baseline/upgrade path. Keep migration validation required in CI.
2. **Security:** authentication, roles, password policy, failure throttling and HTTPS configuration exist. Verify real certificates, proxy-aware edge controls and deployment configuration. Cross-instance socket revocation/tenant isolation are not implemented.
3. **PostgreSQL:** retain the passing CI evidence for the released commit; verify persistence, reports and restarts on the staging database. The screenshot is narrower evidence than full workflow acceptance.
4. **Browser:** rerun the fixed CI maintenance scenario, then verify live login/roles, aircraft, flights, maintenance, operations and downloads against the backend. Mocked UI tests alone are insufficient.
5. **Hardware:** deferred at the user's request while ESP32 is disconnected. Perform the checklist below when available.
6. **Performance/recovery:** batch export and deterministic worker-capacity tests exist. Run staging load checks against agreed targets and complete a real isolated restore drill.
7. **Deployment:** container, PostgreSQL Compose and HTTPS gateway configuration exist. No staging host/domain deployment or production promotion has been verified.

## Hardware acceptance checklist

- Record firmware/device revision and configured flight/COM port.
- Verify joystick axes, throttle, heading and ultrasonic altitude units.
- Disconnect USB; confirm stale UI after ten seconds and reconnect recovery.
- Exercise missing/invalid sensor readings, invalid/oversized packets and shutdown.
- Record pass/fail evidence. These are simulator checks, not flight certification.

## Release decision

Do not declare production-ready until the relevant gates have recorded evidence for the actual release commit. A deployment, restore drill or browser/hardware result must not be inferred from passing unit tests.

Use [Operations](OPERATIONS.md) for commands, limits and troubleshooting, [Architecture](ARCHITECTURE.md) for implementation structure and [Requirements](requirements/README.md) for intended feature scope. [Archived notes](archive/README.md) preserve development history and earlier, potentially outdated claims.
