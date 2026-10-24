# Release acceptance

Status reviewed: 2026-10-25. The application has substantial implementation and automated coverage; production acceptance remains incomplete.

## Evidence

| Check | Recorded result | Limit |
| --- | --- | --- |
| Local backend verify/package | 86 tests passed in this demo verification run | Re-run before release |
| Local frontend unit tests/build | 21 tests/build passed | Large simulator chunk warning remains |
| npm audit | Zero reported vulnerabilities after Vite update | Point-in-time result |
| Flyway migration | H2 PostgreSQL-mode schema validation and repeat-run passed | Not PostgreSQL evidence by itself |
| GitHub backend/PostgreSQL jobs | User-provided screenshot showed both passing | No direct CI log/commit inspection performed here |
| GitHub browser job | Earlier screenshot showed maintenance failure; all four now pass locally | Remote rerun result not supplied |
| Browser test suite | Four mocked workflow specs passed locally using installed Chrome | Not live full-stack acceptance |
| Backup/restore scripts | PowerShell syntax checked | No real restore performed |

## Release gates

1. **Database migrations:** V1 is implemented. Review any existing production schema and document a safe baseline/upgrade path. Keep migration validation required in CI.
2. **Security:** authentication, roles, password policy, failure throttling and HTTPS configuration exist. Verify real certificates, proxy-aware edge controls and deployment configuration. Cross-instance socket revocation/tenant isolation are not implemented.
3. **PostgreSQL:** retain the passing CI evidence for the released commit; verify persistence, reports and restarts on the staging database. The screenshot is narrower evidence than full workflow acceptance.
4. **Browser:** rerun the fixed CI maintenance scenario, then verify live login/roles, aircraft, flights, maintenance, operations and downloads against the backend. Mocked UI tests alone are insufficient.
5. **Hardware:** controller/plane firmware uploads were flash-verified on COM3/COM7. Wi-Fi discovery, serial telemetry and backend broadcasting were observed; the user confirmed corrected left/right behavior. Complete the remaining live tilt, takeoff, reconnect and sensor-fault checks. Ultrasonic no-echo was observed and remains unresolved.
6. **Performance/recovery:** batch export and deterministic worker-capacity tests exist. Run staging load checks against agreed targets and complete a real isolated restore drill.
7. **Deployment:** container, PostgreSQL Compose and HTTPS gateway configuration exist. No staging host/domain deployment or production promotion has been verified.

## Hardware acceptance checklist

- Record firmware/device revision and configured flight/COM port.
- Verify joystick axes, throttle, heading and ultrasonic altitude units.
- Disconnect USB; confirm stale UI after ten seconds and reconnect recovery.
- Exercise missing/invalid sensor readings, invalid/oversized packets and shutdown.
- Record pass/fail evidence. These are simulator checks, not flight certification.

## Demo verification (2026-10-25)

- Backend Maven verify/package: 86 tests passed.
- Frontend Node tests: 21 passed; production build passed; npm audit reported zero vulnerabilities.
- Both ESP32 sketches compile for esp32:esp32:esp32. The plane/controller identities were separately verified during earlier uploads; no new upload was required for this test pass.
- Playwright browser tests: 4 passed in 4.5 seconds using installed Chrome through a temporary local configuration. The missing bundled runtime/download prevented the default launch; CI still installs its pinned Chromium runtime. No permanent executable path was added. These tests mock REST and are not live full-stack IoT tests.
- Automated checks cover demo dynamics and bank turns, not a calibrated aerodynamic model. Raw telemetry/history retain sensor values; simulator altitude is local virtual state.

Follow [Demo walkthrough](DEMO_GUIDE.md) for a repeatable presentation. Live full-stack browser acceptance, PostgreSQL staging evidence, restore/load checks and complete physical sensor acceptance remain pending.

## Release decision

Do not declare production-ready until the relevant gates have recorded evidence for the actual release commit. A deployment, restore drill or browser/hardware result must not be inferred from passing unit tests.

Use [Operations](OPERATIONS.md) for commands, limits and troubleshooting, [Architecture](ARCHITECTURE.md) for implementation structure and [Requirements](requirements/README.md) for intended feature scope. [Archived notes](archive/README.md) preserve development history and earlier, potentially outdated claims.
