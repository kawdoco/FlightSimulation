#include <WiFi.h>
#include <WiFiUdp.h>
#include <stdio.h>
#include <string.h>

// Status lines are ignored by the backend; telemetry remains JSON.
#define SERIAL_DIAGNOSTICS 1

// Fill in the same 2.4 GHz Wi-Fi credentials in both ESP32 sketches.
const char* WIFI_SSID = "Iphone 16";
const char* WIFI_PASSWORD = "1234abcd";

constexpr uint16_t UDP_PORT = 4210;
constexpr uint32_t COMMAND_INTERVAL_MS = 50;
constexpr int JOY_X_PIN = 34;
constexpr int JOY_Y_PIN = 35;
constexpr int JOY_SW_PIN = 27;
constexpr int THROTTLE_PIN = 32;

WiFiUDP udp;
int joystickCenterX = 2048;
int joystickCenterY = 2048;
uint32_t lastCommandSentAt = 0;
uint32_t lastWiFiAttemptAt = 0;
uint32_t lastDiagnosticsAt = 0;
uint32_t controlPacketsSent = 0;
uint32_t telemetryPacketsReceived = 0;
bool wifiWasConnected = false;

void connectToWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lastWiFiAttemptAt = millis();
#if SERIAL_DIAGNOSTICS
  Serial.printf("Connecting to Wi-Fi network \"%s\".\n", WIFI_SSID);
#endif
}

void keepWiFiConnected() {
  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  if (millis() - lastWiFiAttemptAt >= 5000) {
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    lastWiFiAttemptAt = millis();
#if SERIAL_DIAGNOSTICS
    Serial.println("Wi-Fi reconnect attempt.");
#endif
  }
}

int calibrateAxis(int pin) {
  long total = 0;
  for (int sample = 0; sample < 100; sample++) {
    total += analogRead(pin);
    delay(5);
  }
  return total / 100;
}

float readJoystickAxis(int pin, int center) {
  const int deadZone = 280;
  const int value = analogRead(pin);
  const int difference = value - center;

  if (abs(difference) <= deadZone) {
    return 0.0f;
  }

  const int usableDifference =
      difference > 0 ? difference - deadZone : difference + deadZone;
  const int usableRange =
      difference > 0 ? 4095 - center - deadZone : center - deadZone;

  if (usableRange <= 0) {
    return 0.0f;
  }
  return constrain(static_cast<float>(usableDifference) / usableRange, -1.0f, 1.0f);
}

void sendControlPacket() {
  const float stickX = readJoystickAxis(JOY_X_PIN, joystickCenterX);
  const float stickY = readJoystickAxis(JOY_Y_PIN, joystickCenterY);
  const int throttle = map(analogRead(THROTTLE_PIN), 0, 4095, 0, 100);
  const int buttonPressed = digitalRead(JOY_SW_PIN) == LOW ? 1 : 0;

  char packet[64];
  snprintf(
      packet,
      sizeof(packet),
      "C,%.3f,%.3f,%d,%d",
      stickX,
      stickY,
      throttle,
      buttonPressed
  );

  udp.beginPacket(IPAddress(255, 255, 255, 255), UDP_PORT);
  udp.write(reinterpret_cast<const uint8_t*>(packet), strlen(packet));
  const int sent = udp.endPacket();
#if SERIAL_DIAGNOSTICS
  if (sent != 1) {
    Serial.println("ERROR: UDP control packet send failed.");
  } else {
    controlPacketsSent++;
  }
#endif
}

void emitTelemetryJson(const char* packet) {
  float altitude;
  float speed;
  float pitch;
  float roll;
  float heading;
  float throttle;
  float fuel;
  int altitudeValid = -1;
  int imuValid = -1;
  int commandFresh = -1;

  const int fields = sscanf(
          packet,
          "T,%f,%f,%f,%f,%f,%f,%f,%d,%d,%d",
          &altitude,
          &speed,
          &pitch,
          &roll,
          &heading,
          &throttle,
          &fuel, &altitudeValid, &imuValid, &commandFresh
      );
  if (fields != 7 && fields != 10) {
#if SERIAL_DIAGNOSTICS
    Serial.println("ERROR: Telemetry packet format is invalid.");
#endif
    return;
  }

  // Keep USB serial output machine-readable for the Spring Boot serial listener.
  Serial.printf(
      "{\"altitude\":%.2f,\"speed\":%.2f,\"pitch\":%.2f,"
      "\"roll\":%.2f,\"heading\":%.2f,\"throttle\":%.0f,\"fuel\":%.1f,"
      "\"altitudeValid\":%s,\"imuValid\":%s,\"commandFresh\":%s}\n",
      max(0.0f, altitude),
      max(0.0f, speed),
      pitch,
      roll,
      constrain(heading, 0.0f, 360.0f),
      constrain(throttle, 0.0f, 100.0f),
      constrain(fuel, 0.0f, 100.0f),
      fields == 10 ? (altitudeValid == 1 ? "true" : "false") : "null",
      fields == 10 ? (imuValid == 1 ? "true" : "false") : "null",
      fields == 10 ? (commandFresh == 1 ? "true" : "false") : "null"
  );
}

void receivePlaneTelemetry() {
  int packetSize = udp.parsePacket();
  while (packetSize > 0) {
    char packet[128];
    const int bytesRead = udp.read(packet, sizeof(packet) - 1);
    if (bytesRead > 0) {
      packet[bytesRead] = '\0';
      if (packet[0] == 'T' && packet[1] == ',') {
        telemetryPacketsReceived++;
        emitTelemetryJson(packet);
#if SERIAL_DIAGNOSTICS
      } else {
        Serial.println("WARNING: Received an invalid telemetry packet.");
#endif
      }
    }
    packetSize = udp.parsePacket();
  }
}

void setup() {
  Serial.begin(115200);
  delay(300);
#if SERIAL_DIAGNOSTICS
  Serial.println("Controller starting; waiting for Wi-Fi and plane telemetry.");
#endif
  analogReadResolution(12);
  pinMode(JOY_SW_PIN, INPUT_PULLUP);

  // Keep the joystick centered while the controller powers up.
  joystickCenterX = calibrateAxis(JOY_X_PIN);
  joystickCenterY = calibrateAxis(JOY_Y_PIN);

  connectToWiFi();
  udp.begin(UDP_PORT);
}

void loop() {
  keepWiFiConnected();
  const bool wifiConnected = WiFi.status() == WL_CONNECTED;
#if SERIAL_DIAGNOSTICS
  if (wifiConnected != wifiWasConnected) {
    if (wifiConnected) {
      Serial.printf("Wi-Fi connected. Controller IP: %s\n",
                    WiFi.localIP().toString().c_str());
    } else {
      Serial.println("Wi-Fi disconnected; reconnecting.");
    }
  }
#endif
  wifiWasConnected = wifiConnected;
  receivePlaneTelemetry();

  if (millis() - lastDiagnosticsAt >= 2000) {
#if SERIAL_DIAGNOSTICS
    Serial.printf(
        "UDP status: controller IP=%s, sent=%lu, telemetry received=%lu\n",
        WiFi.localIP().toString().c_str(),
        static_cast<unsigned long>(controlPacketsSent),
        static_cast<unsigned long>(telemetryPacketsReceived)
    );
    if (!wifiConnected) {
      Serial.printf("Waiting for 2.4 GHz Wi-Fi; connection status=%d\n", WiFi.status());
    } else if (telemetryPacketsReceived == 0) {
      Serial.println("Waiting for plane telemetry; check plane power, MPU6050 and UDP connectivity.");
    }
#endif
    lastDiagnosticsAt = millis();
  }

  if (wifiConnected
      && millis() - lastCommandSentAt >= COMMAND_INTERVAL_MS) {
    sendControlPacket();
    lastCommandSentAt = millis();
  }

  delay(2);
}
