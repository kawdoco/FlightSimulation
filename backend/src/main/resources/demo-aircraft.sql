-- =====================================================
-- Sprint 3 - Aircraft Demo Data
-- Issue #22
-- =====================================================

INSERT INTO aircraft (
    registration_number,
    model,
    manufacturer,
    status,
    fuel_capacity,
    max_speed,
    max_altitude
)
VALUES
(
    '4R-AAA',
    'A320',
    'Airbus',
    'AVAILABLE',
    24210,
    871,
    39800
),
(
    '4R-BBB',
    'B737',
    'Boeing',
    'MAINTENANCE',
    26020,
    876,
    41000
),
(
    '4R-CCC',
    'A330',
    'Airbus',
    'OUT_OF_SERVICE',
    97530,
    913,
    41450
),
(
    '4R-DDD',
    'B787',
    'Boeing',
    'AVAILABLE',
    126372,
    954,
    43000
)
ON CONFLICT (registration_number) DO NOTHING;