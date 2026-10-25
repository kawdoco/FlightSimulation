#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ESP32Servo.h>
#include <WiFi.h>
#include <WiFiUdp.h>
#include <Wire.h>
#include <math.h>
#include <stdio.h>
#include <string.h>

// Use the same 2.4 GHz Wi-Fi credentials as the controller ESP32.
const char* WIFI_SSID = "Iphone 16";
const char* WIFI_PASSWORD = "1234abcd";

constexpr uint16_t UDP_PORT = 4210;
constexpr int SERVO_ROLL_PIN = 18;
constexpr int SERVO_PITCH_PIN = 19;
constexpr int TRIG_PIN = 26;
constexpr int ECHO_PIN = 25;
constexpr int SERVO_CENTER = 90;
constexpr int SERVO_TRAVEL_DEGREES = 45;
constexpr uint32_t CONTROL_TIMEOUT_MS = 500;
constexpr uint32_t SENSOR_INTERVAL_MS = 50;
constexpr uint32_t TELEMETRY_INTERVAL_MS = 100;

Adafruit_MPU6050 mpu;
Servo rollServo;
Servo pitchServo;
WiFiUDP udp;

IPAddress controllerAddress;
bool controllerDiscovered = false;
float controlRoll = 0.0f;
float controlPitch = 0.0f;
int throttlePercent = 0;
float pitchOffset = 0.0f;
float rollOffset = 0.0f;
float gyroZOffset = 0.0f;
float pitchDegrees = 0.0f;
float rollDegrees = 0.0f;
float headingDegrees = 0.0f;
float filteredPitch = 0.0f;
float filteredRoll = 0.0f;
float altitudeCm = 0.0f;
float groundDistanceCm = 0.0f;
float distanceCm = 0.0f;
bool groundCalibrated = false;
bool imuReady = false;
uint8_t activeMpuAddress = 0x68;
uint32_t lastMpuAttemptAt = 0;

bool initializeMpu() {
  lastMpuAttemptAt = millis();
  activeMpuAddress = 0x68;
  bool detected = mpu.begin(activeMpuAddress, &Wire);
  if (!detected) { activeMpuAddress = 0x69; detected = mpu.begin(activeMpuAddress, &Wire); }
  if (!detected) {
    Serial.println("ERROR: MPU6050 unavailable; joystick controls remain active; retrying in 5 seconds.");
    return false;
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  // Recovery does not recalibrate a moving aircraft. Startup calibration runs once below.
  Serial.println("MPU6050 connected.");
  return true;
}
uint32_t lastCommandAt = 0;
uint32_t lastSensorReadAt = 0;
uint32_t lastTelemetrySentAt = 0;
uint32_t lastWiFiAttemptAt = 0;
uint32_t lastNetworkStatusAt = 0;
uint32_t controlPacketsReceived = 0;
uint32_t telemetryPacketsSent = 0;

float wrapHeading(float heading) {
  while (heading >= 360.0f) heading -= 360.0f;
  while (heading < 0.0f) heading += 360.0f;
  return heading;
}

void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lastWiFiAttemptAt = millis();
}

void keepWiFiConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }
  if (millis() - lastWiFiAttemptAt >= 5000) {
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    lastWiFiAttemptAt = millis();
  }
}

void readAttitude(float& pitch, float& roll, float& gyroZ) {
  if (imuReady) {
    Wire.beginTransmission(activeMpuAddress);
    if (Wire.endTransmission() != 0) imuReady = false;
  }
  if (!imuReady) { pitch = pitchOffset; roll = rollOffset; gyroZ = gyroZOffset; return; }
  sensors_event_t acceleration;
  sensors_event_t gyroscope;
  sensors_event_t temperature;
  if (!mpu.getEvent(&acceleration, &gyroscope, &temperature)) {
    imuReady = false;
    pitch = pitchOffset; roll = rollOffset; gyroZ = gyroZOffset;
    return;
  }

  pitch = atan2(
      acceleration.acceleration.y,
      sqrt(
          acceleration.acceleration.x * acceleration.acceleration.x
          + acceleration.acceleration.z * acceleration.acceleration.z
      )
  ) * 180.0f / PI;
  roll = atan2(
      -acceleration.acceleration.x,
      acceleration.acceleration.z
  ) * 180.0f / PI;
  gyroZ = gyroscope.gyro.z;
}

void calibrateMpu() {
  constexpr int sampleCount = 100;
  float pitchTotal = 0.0f;
  float rollTotal = 0.0f;
  float gyroZTotal = 0.0f;

  for (int sample = 0; sample < sampleCount; sample++) {
    float pitch;
    float roll;
    float gyroZ;
    readAttitude(pitch, roll, gyroZ);
    pitchTotal += pitch;
    rollTotal += roll;
    gyroZTotal += gyroZ;
    delay(10);
  }

  pitchOffset = pitchTotal / sampleCount;
  rollOffset = rollTotal / sampleCount;
  gyroZOffset = gyroZTotal / sampleCount;
}

float readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  const unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) {
    return 0.0f;
  }
  return duration * 0.0343f / 2.0f;
}

void calibrateGround() {
  Serial.println("Ground calibration: keep the plane on the ground and sensor facing down.");
  float samples[20];
  int validSamples = 0;
  for (int sample = 0; sample < 20; sample++) {
    const float distance = readDistanceCm();
    if (distance >= 2.0f && distance <= 400.0f) {
      samples[validSamples++] = distance;
    }
    delay(60);
  }
  if (validSamples < 5) {
    Serial.println("ERROR: Ground calibration failed; altitude stays zero. Check ultrasonic sensor and reset on the ground.");
    return;
  }
  // Median rejects occasional ultrasonic spikes during startup.
  for (int i = 1; i < validSamples; i++) {
    const float value = samples[i];
    int j = i - 1;
    while (j >= 0 && samples[j] > value) {
      samples[j + 1] = samples[j];
      j--;
    }
    samples[j + 1] = value;
  }
  groundDistanceCm = samples[validSamples / 2];
  groundCalibrated = true;
  altitudeCm = 0.0f;
  Serial.printf("Ground calibrated at %.2f cm; relative altitude is zero.\n", groundDistanceCm);
}

void receiveControllerCommands() {
  int packetSize = udp.parsePacket();
  while (packetSize > 0) {
    char packet[96];
    const int bytesRead = udp.read(packet, sizeof(packet) - 1);
    if (bytesRead > 0) {
      packet[bytesRead] = '\0';

      char type;
      float stickX;
      float stickY;
      int throttle;
      int resetHeading;
      if (sscanf(
              packet,
              "%c,%f,%f,%d,%d",
              &type,
              &stickX,
              &stickY,
              &throttle,
              &resetHeading
          ) == 5
          && type == 'C' && isfinite(stickX) && isfinite(stickY)) {
        controlPacketsReceived++;
        controllerAddress = udp.remoteIP();
        controllerDiscovered = true;
        controlRoll = constrain(stickX, -1.0f, 1.0f);
        controlPitch = constrain(-stickY, -1.0f, 1.0f);
        throttlePercent = constrain(throttle, 0, 100);
        lastCommandAt = millis();
        if (resetHeading == 1) {
          headingDegrees = 0.0f;
        }
      }
    }
    packetSize = udp.parsePacket();
  }
}

void updateControlSurfaces() {
  if (!controllerDiscovered
      || millis() - lastCommandAt > CONTROL_TIMEOUT_MS) {
    controlRoll = 0.0f;
    controlPitch = 0.0f;
    throttlePercent = 0;
  }

  const int rollAngle = SERVO_CENTER
      + static_cast<int>(controlRoll * SERVO_TRAVEL_DEGREES);
  const int pitchAngle = SERVO_CENTER
      + static_cast<int>(controlPitch * SERVO_TRAVEL_DEGREES);
  rollServo.write(constrain(rollAngle, 45, 135));
  pitchServo.write(constrain(pitchAngle, 45, 135));
}

void updateSensors(uint32_t now) {
  float rawPitch;
  float rawRoll;
  float gyroZ;
  readAttitude(rawPitch, rawRoll, gyroZ);
  if (!imuReady) { filteredPitch = 0.0f; filteredRoll = 0.0f; }

  pitchDegrees = constrain(rawPitch - pitchOffset, -45.0f, 45.0f);
  rollDegrees = constrain(rawRoll - rollOffset, -45.0f, 45.0f);
  filteredPitch = filteredPitch * 0.85f + pitchDegrees * 0.15f;
  filteredRoll = filteredRoll * 0.85f + rollDegrees * 0.15f;
  if (fabs(filteredPitch) < 0.5f) filteredPitch = 0.0f;
  if (fabs(filteredRoll) < 0.5f) filteredRoll = 0.0f;

  const float elapsedSeconds = min(0.25f, (now - lastSensorReadAt) / 1000.0f);
  float yawRate = (gyroZ - gyroZOffset) * 180.0f / PI;
  if (!isfinite(yawRate) || fabs(yawRate) < 1.5f) yawRate = 0.0f;
  headingDegrees = wrapHeading(
      headingDegrees + yawRate * elapsedSeconds
  );
  lastSensorReadAt = now;
  distanceCm = readDistanceCm();
  if (groundCalibrated && distanceCm >= 2.0f && distanceCm <= 400.0f) {
    const float height = max(0.0f, distanceCm - groundDistanceCm);
    // Suppress ground-level jitter; preserve the last altitude on missing echoes.
    altitudeCm = height <= 2.0f ? 0.0f : altitudeCm * 0.7f + height * 0.3f;
  }
}

void printSensorData() {
  if (distanceCm > 0.0f) {
    Serial.printf("Ultrasonic: %.2f cm | Relative altitude: %.2f cm | Ground: %s",
                  distanceCm, altitudeCm, groundCalibrated ? "calibrated" : "not calibrated");
  } else {
    Serial.print("Ultrasonic: no echo");
  }
  Serial.printf(
      " | MPU6050 Pitch: %.2f deg | Roll: %.2f deg | Heading: %.2f deg"
      " | Wi-Fi: %s | Controller: %s\n",
      filteredPitch,
      filteredRoll,
      headingDegrees,
      WiFi.status() == WL_CONNECTED ? "connected" : "disconnected",
      controllerDiscovered ? "discovered" : "not discovered"
  );
}

void sendTelemetry() {
  if (!controllerDiscovered || WiFi.status() != WL_CONNECTED) {
    return;
  }

  const float speed = throttlePercent * 3.0f;
  // Combine physical aircraft tilt with joystick attitude commands.
  // Sensor axes follow the mounted orientation: nose pitch uses -filteredRoll.
  // Bank direction follows the updated physical left/right mounting.
  const float simulatorPitch = constrain(-filteredRoll + controlPitch * 25.0f, -45.0f, 45.0f);
  const float simulatorRoll = constrain(filteredPitch + controlRoll * 40.0f, -45.0f, 45.0f);
  char packet[128];
  snprintf(
      packet,
      sizeof(packet),
      "T,%.2f,%.2f,%.2f,%.2f,%.2f,%d,100,%d,%d,%d",
      altitudeCm,
      speed,
      simulatorPitch,
      simulatorRoll,
      headingDegrees,
      throttlePercent,
      groundCalibrated && distanceCm >= 2.0f && distanceCm <= 400.0f ? 1 : 0,
      imuReady ? 1 : 0,
      controllerDiscovered && millis() - lastCommandAt <= CONTROL_TIMEOUT_MS ? 1 : 0
  );

  udp.beginPacket(controllerAddress, UDP_PORT);
  udp.write(reinterpret_cast<const uint8_t*>(packet), strlen(packet));
  if (udp.endPacket() != 1) {
    Serial.println("ERROR: UDP telemetry send failed.");
  } else {
    telemetryPacketsSent++;
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);
  Serial.println("Plane sensor monitor started (115200 baud).");
  Wire.begin(21, 22);

  rollServo.setPeriodHertz(50);
  pitchServo.setPeriodHertz(50);
  rollServo.attach(SERVO_ROLL_PIN, 500, 2500);
  pitchServo.attach(SERVO_PITCH_PIN, 500, 2500);
  rollServo.write(SERVO_CENTER);
  pitchServo.write(SERVO_CENTER);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  Wire.setTimeOut(50);
  imuReady = initializeMpu();
  if (imuReady) calibrateMpu();
  calibrateGround();

  connectToWiFi();
  udp.begin(UDP_PORT);
  Serial.printf("Plane Wi-Fi connecting to %s; UDP port %u.\n",
                WIFI_SSID,
                UDP_PORT);
  lastSensorReadAt = millis();
}

void loop() {
  keepWiFiConnected();
  receiveControllerCommands();
  if (!imuReady && millis() - lastMpuAttemptAt >= 5000) imuReady = initializeMpu();
  updateControlSurfaces();

  const uint32_t now = millis();
  if (now - lastSensorReadAt >= SENSOR_INTERVAL_MS) {
    updateSensors(now);
  }
  if (now - lastTelemetrySentAt >= TELEMETRY_INTERVAL_MS) {
    sendTelemetry();
    printSensorData();
    lastTelemetrySentAt = now;
  }
  if (now - lastNetworkStatusAt >= 2000)
 {
    Serial.printf(
        "UDP status: plane IP=%s, controller=%s, commands received=%lu, telemetry sent=%lu\n",
        WiFi.localIP().toString().c_str(),
        controllerDiscovered ? controllerAddress.toString().c_str() : "not discovered",
        static_cast<unsigned long>(controlPacketsReceived),
        static_cast<unsigned long>(telemetryPacketsSent)
    );
    Serial.printf(
        "Servo controls: roll=%.3f pitch=%.3f | target roll=%d pitch=%d | command age=%lu ms\n",
        controlRoll, controlPitch,
        constrain(SERVO_CENTER + static_cast<int>(controlRoll * SERVO_TRAVEL_DEGREES), 45, 135),
        constrain(SERVO_CENTER + static_cast<int>(controlPitch * SERVO_TRAVEL_DEGREES), 45, 135),
        static_cast<unsigned long>(millis() - lastCommandAt)
    );
    lastNetworkStatusAt = now;
  }
  delay(2);
}
