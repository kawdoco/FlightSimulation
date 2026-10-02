\# Aircraft Management Requirements



\## 1. Overview



The Aircraft Management module is responsible for managing aircraft information within the FlightSimulation system.



This module provides the required aircraft data for flight scheduling, flight simulation, telemetry monitoring, maintenance management, and IoT integration.



\---



\## 2. Objectives



The main objectives of the Aircraft Management module are:



\- Store and manage aircraft information.

\- Allow authorized users to create, view, update, and delete aircraft records.

\- Maintain the operational status of each aircraft.

\- Provide aircraft information for flight assignment.

\- Validate aircraft data before storing it in the database.

\- Integrate aircraft information with other system modules.



\---



\## 3. Aircraft Entity Fields



The Aircraft entity should contain the following fields:



| Field | Type | Description |

|---|---|---|

| id | Long | Unique aircraft identifier |

| registrationNumber | String | Unique aircraft registration number |

| model | String | Aircraft model |

| manufacturer | String | Aircraft manufacturer |

| status | Enum/String | Current aircraft status |

| fuelCapacity | Double | Maximum fuel capacity |

| maxSpeed | Double | Maximum supported speed |

| maxAltitude | Double | Maximum supported altitude |



\---



\## 4. Aircraft Status Lifecycle



The system should support aircraft statuses such as:



\- AVAILABLE

\- IN\_FLIGHT

\- MAINTENANCE

\- OUT\_OF\_SERVICE



An aircraft should normally be assigned to a new flight only when its status is `AVAILABLE`.



Aircraft status may change according to flight operations and maintenance activities.



Example lifecycle:



AVAILABLE → IN\_FLIGHT → AVAILABLE



or



AVAILABLE → MAINTENANCE → AVAILABLE



An aircraft with `OUT\_OF\_SERVICE` status should not be assigned to a flight.



\---



\## 5. CRUD Operations



The Aircraft Management module should provide the following operations:



\### Create Aircraft



Authorized users should be able to register a new aircraft.



\### View Aircraft



Users should be able to:



\- View all aircraft.

\- View a specific aircraft using its ID.

\- View aircraft details and current status.



\### Update Aircraft



Authorized users should be able to update aircraft information including:



\- Model

\- Manufacturer

\- Status

\- Fuel capacity

\- Maximum speed

\- Maximum altitude



\### Delete Aircraft



Authorized users should be able to remove aircraft records when appropriate.



Aircraft records linked to active flights should not be deleted without validation.



\---



\## 6. Validation Requirements



The system should validate aircraft information before saving it.



Validation requirements include:



\- Registration number must not be empty.

\- Registration number must be unique.

\- Aircraft model must not be empty.

\- Manufacturer must not be empty.

\- Fuel capacity must be greater than zero.

\- Maximum speed must be greater than zero.

\- Maximum altitude must be greater than zero.

\- Aircraft status must contain a valid supported value.



Invalid requests should return an appropriate error response.



\---



\## 7. REST API Requirements



The Spring Boot backend should provide REST endpoints for Aircraft Management.



Suggested endpoints:



| Method | Endpoint | Description |

|---|---|---|

| GET | /api/aircraft | Retrieve all aircraft |

| GET | /api/aircraft/{id} | Retrieve an aircraft by ID |

| POST | /api/aircraft | Create a new aircraft |

| PUT | /api/aircraft/{id} | Update an aircraft |

| DELETE | /api/aircraft/{id} | Delete an aircraft |



The API should exchange data using JSON.



\---



\## 8. Frontend Requirements



The React frontend should provide an Aircraft Management page.



The page should allow users to:



\- View the aircraft list.

\- View aircraft details.

\- Add a new aircraft.

\- Edit aircraft information.

\- Delete an aircraft where permitted.

\- View the operational status of each aircraft.

\- Display validation and API error messages.



The interface should communicate with the Spring Boot REST API.



\---



\## 9. Aircraft and Flight Relationship



An aircraft can participate in multiple flights over time.



Each flight should be associated with an aircraft.



Before assigning an aircraft to a flight, the system should verify that:



\- The aircraft exists.

\- The aircraft is available.

\- The aircraft is not currently assigned to an incompatible active flight.

\- The aircraft is not under maintenance.

\- The aircraft is not out of service.



\---



\## 10. Database Requirements



Aircraft information should be stored in the PostgreSQL database.



The aircraft table should include a primary key for the aircraft ID.



The registration number should have a unique constraint.



Aircraft records should be related to flight and maintenance records using appropriate database relationships.



\---



\## 11. Backend Requirements



The Spring Boot backend should follow a layered architecture.



Recommended structure:



Controller → Service → Repository → Database



The module should include:



\- Aircraft entity/model

\- Aircraft repository

\- Aircraft service

\- Aircraft controller

\- Validation and exception handling



Spring Data JPA should be used for database operations.



\---



\## 12. Integration with Other Modules



Aircraft Management should integrate with:



\- Flight Management

\- Flight Simulator

\- Live Telemetry

\- Maintenance Management

\- Alert Management

\- IoT Integration



Aircraft information should be available to other modules through backend services and APIs.



\---



\## 13. Expected Outcome



The Aircraft Management module should provide a reliable and maintainable way to manage aircraft information and make aircraft data available to the other components of the FlightSimulation system.



This specification will be used as the foundation for implementing and improving the Aircraft Management module during the upcoming development sprints.

