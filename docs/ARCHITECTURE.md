# Architecture

## Layers and ownership

The application uses Spring MVC REST endpoints with a separate React view. Controllers validate transport input and return responses. Services own lifecycle rules and transaction boundaries. Repositories persist JPA models. Request DTOs exclude server-managed identifiers, timestamps and relationships.

| Layer | Location | Responsibility |
| --- | --- | --- |
| View | frontend/src/pages, components, simulator | Forms, reporting and Three.js rendering |
| Transport | backend/src/main/java/com/flightsimulation/controller | REST contracts and validation |
| Application | backend/src/main/java/com/flightsimulation/service | Business rules, transactions, audit and ingestion |
| Persistence | backend/src/main/java/com/flightsimulation/repository, entity | Queries, models and optimistic versions |
| Integration | backend/src/main/java/com/flightsimulation/serial, config | ESP32, STOMP, security and async workers |

## Data flow

Controller ESP32 sends UDP controls to the plane ESP32. The plane returns sensor readings; the controller relays JSON by USB serial. Spring validates bounded packets, converts ultrasonic centimeters to feet, saves samples for the configured flight and broadcasts telemetry by STOMP. If the configured flight does not exist, hardware preview may broadcast without persistence. React displays the values and simulator state.

REST telemetry writes use the same save-and-broadcast service. Keyboard simulation is a separate frontend control mode.

## Data model and persistence

Aircraft are referenced by flights; telemetry references flights. Alerts and maintenance records store aircraft identifiers; alerts may also identify a flight. Application users hold BCrypt hashes and roles. Audit records hold actor, action, target and UTC timestamps.

Local development uses file-backed H2 and Hibernate schema update. Production uses PostgreSQL, Flyway migrations and Hibernate validation. Existing schemas require deliberate migration/baseline review. Never run production configuration against an unreviewed existing schema.

Aircraft, flights, alerts and other versioned entities use optimistic locking. Flight transitions and transactional audit records commit together. Maintenance follows OPEN -> IN_PROGRESS -> COMPLETED; work orders do not automatically change aircraft operational status.

## Security

REST uses stateless HTTP Basic; HTTPS is required for remote deployment. The frontend keeps credentials in memory. VIEWER/OPERATOR/ADMIN can read domain APIs, OPERATOR/ADMIN can mutate and ADMIN can delete. User management, readiness and audit APIs require ADMIN. Password changes require current credentials. Users share aircraft visibility; tenant isolation is not implemented.

STOMP CONNECT authenticates credentials; subscriptions are restricted to telemetry topics and client publishing is rejected. Account changes close associated sockets after commit within the same backend process. Cross-instance revocation is not implemented. Allowed origins come from configuration. Password hashes and request passwords are excluded from JSON output and sensitive request string output is redacted.

## Query and response contracts

Telemetry history is paginated with deterministic time/ID ordering. Summary statistics execute database aggregates. CSV export uses descending-ID batches with an initial maximum ID and escaped metadata; it is not a full transactional snapshot. The legacy list returns at most 200 samples. Users, maintenance and audit use an explicit PageResponse DTO.

Serial ingestion limits frames to 4096 characters and retries disconnected ports. Async workers are bounded and propagate request logging context. See [Operations](OPERATIONS.md) for limits, endpoints and configuration.

## Scope and evidence

[Requirements](requirements/README.md) document planned behavior. [Release acceptance](RELEASE_ACCEPTANCE.md) records verification and remaining release gates. [Historical notes](archive/README.md) retain earlier findings and may contradict the current implementation.
