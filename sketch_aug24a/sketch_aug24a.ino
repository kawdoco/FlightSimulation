#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <WiFi.h>
#include <HTTPClient.h>

// Set these values for the Wi-Fi network and computer running Spring Boot.
const char* WIFI_SSID = "Test - Student";
const char* WIFI_PASSWORD = "BCI#campus";
const char* BACKEND_URL = "http://192.168.28.22:8081/api/telemetry/1";

// ==========================================
// FlightSimulation IoT Controller
// MPU6050 + HC-SR04 + B10K + HW-504
// ==========================================

// ---------- MPU6050 ----------
Adafruit_MPU6050 mpu;

// ---------- Ultrasonic ----------
#define TRIG_PIN 14
#define ECHO_PIN 12

// ---------- Throttle ----------
#define THROTTLE_PIN 32

// ---------- HW-504 Joystick ----------
#define JOY_X_PIN 34
#define JOY_Y_PIN 35
#define JOY_SW_PIN 27

// Heading value
float heading = 0.0;
int joystickCenterX = 2048;
float pitchOffset = 0.0;
float rollOffset = 0.0;
float filteredPitch = 0.0;
float filteredRoll = 0.0;
unsigned long lastTelemetrySentAt = 0;

void readMpuAttitude(float& pitch, float& roll) {
  sensors_event_t accel;
  sensors_event_t gyro;
  sensors_event_t temp;

  mpu.getEvent(&accel, &gyro, &temp);

  pitch = atan2(
    accel.acceleration.y,
    sqrt(
      accel.acceleration.x * accel.acceleration.x +
      accel.acceleration.z * accel.acceleration.z
    )
  ) * 180.0 / PI;

  roll = atan2(
    -accel.acceleration.x,
    accel.acceleration.z
  ) * 180.0 / PI;
}

void calibrateMpuLevel() {
  const int sampleCount = 100;
  float pitchTotal = 0.0;
  float rollTotal = 0.0;

  Serial.println("Keep the aircraft/controller still: calibrating MPU level...");
  for (int sample = 0; sample < sampleCount; sample++) {
    float pitch;
    float roll;
    readMpuAttitude(pitch, roll);
    pitchTotal += pitch;
    rollTotal += roll;
    delay(10);
  }

  pitchOffset = pitchTotal / sampleCount;
  rollOffset = rollTotal / sampleCount;
  Serial.print("MPU level reference: pitch=");
  Serial.print(pitchOffset, 1);
  Serial.print(" roll=");
  Serial.println(rollOffset, 1);
}

void calibrateJoystickCenter() {
  const int sampleCount = 100;
  long total = 0;

  Serial.println("Keep the joystick centered: calibrating joystick...");
  for (int sample = 0; sample < sampleCount; sample++) {
    total += analogRead(JOY_X_PIN);
    delay(5);
  }

  joystickCenterX = total / sampleCount;
  Serial.print("Joystick X center: ");
  Serial.println(joystickCenterX);
}

void connectToWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startedAt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startedAt < 15000) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi connected. ESP32 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi connection failed; retrying in the next loop");
  }
}

void sendTelemetry(float altitude, float speed, float pitch, float roll,
                   float currentHeading, int throttle, float fuel) {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");

  String payload = "{";
  payload += "\"altitude\":" + String(altitude, 2) + ",";
  payload += "\"speed\":" + String(speed, 2) + ",";
  payload += "\"pitch\":" + String(pitch, 2) + ",";
  payload += "\"roll\":" + String(roll, 2) + ",";
  payload += "\"heading\":" + String(currentHeading, 2) + ",";
  payload += "\"throttle\":" + String(throttle) + ",";
  payload += "\"fuel\":" + String(fuel, 2);
  payload += "}";

  int statusCode = http.POST(payload);
  Serial.print("Telemetry POST status: ");
  Serial.println(statusCode);
  if (statusCode < 0) {
    Serial.println(http.errorToString(statusCode));
  }
  http.end();
}

// ==========================================
// Read HC-SR04 Distance
// ==========================================

float readDistanceCM() {

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(
    ECHO_PIN,
    HIGH,
    30000
  );

  if (duration == 0) {
    return -1;
  }

  float distance =
    duration * 0.0343 / 2.0;

  return distance;
}

// ==========================================
// Joystick dead-zone function
// ==========================================

float normalizeJoystick(int value) {

  const int deadZone = 650;

  int difference = value - joystickCenterX;

  if (abs(difference) < deadZone) {
    return 0.0;
  }

  float normalized =
    (float)difference / 2048.0;

  if (normalized > 1.0) {
    normalized = 1.0;
  }

  if (normalized < -1.0) {
    normalized = -1.0;
  }

  return normalized;
}

// ==========================================
// SETUP
// ==========================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  connectToWiFi();

  Serial.println();
  Serial.println("==============================");
  Serial.println("FlightSimulation IoT Starting");
  Serial.println("==============================");

  // --------------------------
  // I2C
  // --------------------------

  Wire.begin(21, 22);

  // --------------------------
  // MPU6050
  // --------------------------

  if (!mpu.begin()) {

    Serial.println("ERROR: MPU6050 not detected!");

    while (1) {
      delay(100);
    }
  }

  Serial.println("MPU6050 Connected");

  mpu.setAccelerometerRange(
    MPU6050_RANGE_8_G
  );

  mpu.setGyroRange(
    MPU6050_RANGE_500_DEG
  );

  mpu.setFilterBandwidth(
    MPU6050_BAND_21_HZ
  );

  calibrateMpuLevel();

  // --------------------------
  // HC-SR04
  // --------------------------

  pinMode(
    TRIG_PIN,
    OUTPUT
  );

  pinMode(
    ECHO_PIN,
    INPUT
  );

  // --------------------------
  // Joystick
  // --------------------------

  pinMode(
    JOY_SW_PIN,
    INPUT_PULLUP
  );

  // ESP32 ADC 0 - 4095
  analogReadResolution(12);

  calibrateJoystickCenter();

  Serial.println("All sensors initialized");
  Serial.println();
}

// ==========================================
// LOOP
// ==========================================

void loop() {

  // ========================================
  // 1. MPU6050
  // ========================================

  float pitch;
  float roll;
  readMpuAttitude(pitch, roll);
  pitch -= pitchOffset;
  roll -= rollOffset;
  pitch = constrain(pitch, -45.0, 45.0);
  roll = constrain(roll, -45.0, 45.0);

  // Smooth accelerometer noise so the aircraft does not jitter at rest.
  filteredPitch = filteredPitch * 0.85 + pitch * 0.15;
  filteredRoll = filteredRoll * 0.85 + roll * 0.15;

  if (fabs(filteredPitch) < 0.5) filteredPitch = 0.0;
  if (fabs(filteredRoll) < 0.5) filteredRoll = 0.0;

  // ========================================
  // 2. B10K THROTTLE
  // ========================================

  int throttleRaw =
    analogRead(THROTTLE_PIN);

  int throttle =
    map(
      throttleRaw,
      0,
      4095,
      0,
      100
    );

  throttle =
    constrain(
      throttle,
      0,
      100
    );

  // ========================================
  // 3. HW-504 JOYSTICK
  // ========================================

  int joystickX =
    analogRead(JOY_X_PIN);

  int joystickY =
    analogRead(JOY_Y_PIN);

  bool joystickButton =
    digitalRead(JOY_SW_PIN) == LOW;

  float yawInput =
    normalizeJoystick(
      joystickX
    );

  // Heading slowly changes
  // according to joystick direction

  // Do not change heading while the joystick is at its calibrated center.
  if (fabs(yawInput) > 0.2) {
    heading += yawInput * 2.0;
  }

  // Keep heading 0 - 359

  if (heading >= 360.0) {
    heading -= 360.0;
  }

  if (heading < 0.0) {
    heading += 360.0;
  }

  // ========================================
  // 4. HC-SR04
  // ========================================

  float distance =
    readDistanceCM();

  // ========================================
  // SERIAL OUTPUT
  // ========================================

  Serial.println(
    "------------------------------------"
  );

  Serial.print("Pitch      : ");
  Serial.print(pitch, 1);
  Serial.println(" deg");

  Serial.print("Roll       : ");
  Serial.print(roll, 1);
  Serial.println(" deg");

  Serial.print("Heading    : ");
  Serial.print(heading, 1);
  Serial.println(" deg");

  Serial.print("Throttle   : ");
  Serial.print(throttle);
  Serial.println(" %");

  Serial.print("Joystick X : ");
  Serial.println(joystickX);

  Serial.print("Joystick Y : ");
  Serial.println(joystickY);

  Serial.print("Joystick SW: ");

  if (joystickButton) {
    Serial.println("PRESSED");
  } else {
    Serial.println("RELEASED");
  }

  Serial.print("Distance   : ");

  if (distance < 0) {

    Serial.println(
      "No reading"
    );

  } else {

    Serial.print(distance, 1);
    Serial.println(" cm");
  }

  // ========================================
  // PROXIMITY WARNING
  // ========================================

  if (
    distance > 0 &&
    distance < 30
  ) {

    Serial.println(
      "*** GROUND PROXIMITY WARNING ***"
    );
  }

  // The ultrasonic distance is used as the simulated altitude. The backend
  // broadcasts this POST to the frontend WebSocket subscribers.
  if (millis() - lastTelemetrySentAt >= 1000) {
    float altitude = distance > 0 ? distance : 0;
    float speed = throttle * 3.0;
    sendTelemetry(altitude, speed, filteredPitch, filteredRoll, heading, throttle, 100.0);
    lastTelemetrySentAt = millis();
  }

  delay(200);
}
