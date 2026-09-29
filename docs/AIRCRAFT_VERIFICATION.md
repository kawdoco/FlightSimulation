# Sprint 3 - Aircraft Workflow Verification

## Issue

[Sprint 3] Verify Aircraft Workflows and Prepare Aircraft Demo Data #22

---

## 1. Aircraft CRUD Verification

### Test 1 - Create Aircraft

**Endpoint**

`POST /api/aircraft`

**Test Data**

```json
{
  "registrationNumber": "4R-AAA",
  "model": "A320",
  "manufacturer": "Airbus",
  "status": "AVAILABLE",
  "fuelCapacity": 24210,
  "maxSpeed": 871,
  "maxAltitude": 39800
}
```

**Expected Result**

- HTTP Status: `201 Created`
- Aircraft record should be saved.
- Generated aircraft ID should be returned.

**Status:** Passed

---

### Test 2 - View All Aircraft

**Endpoint**

`GET /api/aircraft`

**Expected Result**

- HTTP Status: `200 OK`
- All registered aircraft should be returned.

**Status:** Passed

---

### Test 3 - View Aircraft by ID

**Endpoint**

`GET /api/aircraft/{id}`

Example:

`GET /api/aircraft/1`

**Expected Result**

- HTTP Status: `200 OK`
- Correct aircraft record should be returned.

**Status:** Passed

---

### Test 4 - Update Aircraft

**Endpoint**

`PUT /api/aircraft/{id}`

Example:

`PUT /api/aircraft/1`

**Test Data**

```json
{
  "registrationNumber": "4R-AAA",
  "model": "A320neo",
  "manufacturer": "Airbus",
  "status": "AVAILABLE",
  "fuelCapacity": 25000,
  "maxSpeed": 880,
  "maxAltitude": 40000
}
```

**Expected Result**

- HTTP Status: `200 OK`
- Aircraft details should be updated.

**Status:** Passed

---

### Test 5 - Delete Aircraft

**Endpoint**

`DELETE /api/aircraft/{id}`

**Expected Result**

- HTTP Status: `204 No Content`
- Aircraft should be removed if it is not linked to a flight.

**Status:** Passed

---

## 2. Aircraft Validation Verification

### Test 6 - Required Fields

Required fields:

- Registration Number
- Model
- Manufacturer
- Status
- Fuel Capacity
- Maximum Speed
- Maximum Altitude

**Test Data**

```json
{
  "registrationNumber": "",
  "model": "",
  "manufacturer": "",
  "status": "AVAILABLE",
  "fuelCapacity": 24210,
  "maxSpeed": 871,
  "maxAltitude": 39800
}
```

**Expected Result**

- HTTP Status: `400 Bad Request`
- Validation errors should be returned.

**Status:** Passed

---

### Test 7 - Duplicate Registration Number

Create another aircraft using an existing registration number.

Example:

`4R-AAA`

**Expected Result**

- HTTP Status: `409 Conflict`
- Duplicate registration should be rejected.

**Expected Message**

`Aircraft registration number already exists`

**Status:** Passed

---

### Test 8 - Invalid Aircraft Status

**Test Data**

```json
{
  "registrationNumber": "4R-TEST",
  "model": "A320",
  "manufacturer": "Airbus",
  "status": "BROKEN",
  "fuelCapacity": 24210,
  "maxSpeed": 871,
  "maxAltitude": 39800
}
```

**Expected Result**

- HTTP Status: `400 Bad Request`
- Invalid aircraft status should be rejected.

**Status:** Passed

---

### Test 9 - Invalid Numeric Values

**Test Data**

```json
{
  "registrationNumber": "4R-TEST",
  "model": "A320",
  "manufacturer": "Airbus",
  "status": "AVAILABLE",
  "fuelCapacity": -100,
  "maxSpeed": 0,
  "maxAltitude": -500
}
```

**Expected Result**

- HTTP Status: `400 Bad Request`
- Fuel capacity must be greater than zero.
- Maximum speed must be greater than zero.
- Maximum altitude must be greater than zero.

**Status:** Passed

---

## 3. Aircraft Availability Verification

Supported aircraft statuses:

- `AVAILABLE`
- `IN_FLIGHT`
- `MAINTENANCE`
- `OUT_OF_SERVICE`

### AVAILABLE

Aircraft with `AVAILABLE` status can be selected and assigned to a flight.

**Status:** Passed

### IN_FLIGHT

Aircraft with `IN_FLIGHT` status cannot be assigned to another flight.

**Status:** Pending

### MAINTENANCE

Aircraft with `MAINTENANCE` status cannot be selected for a flight.

**Status:** Passed

### OUT_OF_SERVICE

Aircraft with `OUT_OF_SERVICE` status cannot be selected for a flight.

**Status:** Passed

---

## 4. Flight Integration Verification

### Test 10 - Schedule Flight

Only aircraft with status `AVAILABLE` should be selectable when scheduling a flight.

**Expected Result**

- AVAILABLE aircraft should appear in the aircraft selection.
- MAINTENANCE aircraft should not be selectable.
- OUT_OF_SERVICE aircraft should not be selectable.
- IN_FLIGHT aircraft should not be selectable.

**Status:** Passed

---

### Test 11 - Start Flight

When a scheduled flight starts:

`AVAILABLE -> IN_FLIGHT`

**Expected Result**

- Flight status changes to `IN_PROGRESS`.
- Aircraft status changes to `IN_FLIGHT`.

**Status:** Passed

---

### Test 12 - Complete Flight

When an active flight completes:

`IN_FLIGHT -> AVAILABLE`

**Expected Result**

- Flight status changes to `COMPLETED`.
- Aircraft status changes back to `AVAILABLE`.

**Status:** Passed

---

### Test 13 - Start Flight with Unavailable Aircraft

Try to start a flight when the assigned aircraft is unavailable.

**Expected Result**

- Request should be rejected.
- HTTP Status: `409 Conflict`
- A useful availability error message should be displayed.

Example:

`Aircraft 4R-BBB is unavailable. Current status: MAINTENANCE`

**Status:** Passed

---

## 5. Aircraft Delete Protection

### Test 14 - Delete Aircraft Linked to Flight

Try to delete an aircraft that is already linked to a flight record.

**Expected Result**

- Aircraft should not be deleted.
- HTTP Status: `409 Conflict`

**Expected Message**

`Cannot delete aircraft because it is linked to flight records`

**Status:** Passed

---

### Test 15 - Delete Aircraft While In Flight

Try to delete an aircraft with status `IN_FLIGHT`.

**Expected Result**

- Aircraft should not be deleted.
- HTTP Status: `409 Conflict`

**Expected Message**

`Cannot delete an aircraft while it is in flight`

**Status:** Passed

---

## 6. Demo Aircraft Data

| Registration | Model | Manufacturer | Status |
|---|---|---|---|
| 4R-AAA | A320 | Airbus | AVAILABLE |
| 4R-BBB | B737 | Boeing | MAINTENANCE |
| 4R-CCC | A330 | Airbus | OUT_OF_SERVICE |
| 4R-DDD | B787 | Boeing | AVAILABLE |

### Demo Flow

1. Use `4R-AAA` to demonstrate normal aircraft CRUD operations.
2. Use `4R-BBB` to demonstrate a maintenance/unavailable aircraft.
3. Use `4R-CCC` to demonstrate an out-of-service aircraft.
4. Use `4R-DDD` to schedule and start a flight.
5. Verify `4R-DDD` changes from `AVAILABLE` to `IN_FLIGHT`.
6. Complete the flight.
7. Verify `4R-DDD` changes back to `AVAILABLE`.

---

## 7. Verification Results

### Backend

- Maven compile: **Passed**
- Aircraft API: **Passed**
- Aircraft validation: **Passed**
- Aircraft delete protection: **Passed**
- Flight integration: **Passed**

### Frontend

- Vite build: **Passed**
- Aircraft page: **Passed**
- Aircraft CRUD workflow: **Passed**
- Flight aircraft selection: **Passed**
- Aircraft availability messages: **Passed**

---

## 8. Known Issues

- Full Maintenance module workflow verification is pending because the Maintenance source implementation is not currently available in the integrated branch.
- The `IN_FLIGHT` aircraft reassignment check still needs final manual verification.

---

## 9. Final Verification Status

Overall Aircraft Workflow Verification: **In Progress**

Aircraft CRUD operations, validation rules, flight lifecycle integration, aircraft status transitions, and delete-protection rules were successfully verified.

The backend and frontend builds completed successfully. Aircraft creation, retrieval, update, and deletion were verified. Invalid data and duplicate registration numbers were correctly rejected.

Flight integration was also verified. Aircraft change from `AVAILABLE` to `IN_FLIGHT` when a flight starts and return to `AVAILABLE` when the flight is completed.

The final `IN_FLIGHT` aircraft reassignment check must be completed before the overall verification status is changed to **Passed**.