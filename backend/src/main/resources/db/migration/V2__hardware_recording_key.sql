ALTER TABLE telemetry ADD COLUMN ingest_key VARCHAR(36);
CREATE UNIQUE INDEX idx_telemetry_ingest_key ON telemetry(ingest_key);
ALTER TABLE telemetry ADD COLUMN altitude_valid BOOLEAN;
ALTER TABLE telemetry ADD COLUMN imu_valid BOOLEAN;
ALTER TABLE telemetry ADD COLUMN command_fresh BOOLEAN;
