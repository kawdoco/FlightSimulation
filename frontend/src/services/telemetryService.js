import { Client } from "@stomp/stompjs";

const WS_URL = "ws://localhost:8080/ws";

let stompClient = null;

export const connectTelemetryWebSocket = (
  onTelemetryReceived,
  flightId = 1
) => {
  // Already connected/connecting
  if (stompClient?.active) {
    return stompClient;
  }

  const client = new Client({
    brokerURL: WS_URL,

    reconnectDelay: 5000,

    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    debug: (message) => {
      console.log("[STOMP]", message);
    },

    onConnect: () => {
      console.log(
        "✅ Connected to FlightSimulation WebSocket"
      );

      client.subscribe(
        `/topic/telemetry/${flightId}`,
        (message) => {
          try {
            const telemetry = JSON.parse(
              message.body
            );

            console.log(
              "📡 Telemetry received:",
              telemetry
            );

            if (onTelemetryReceived) {
              onTelemetryReceived(telemetry);
            }
          } catch (error) {
            console.error(
              "❌ Telemetry parse error:",
              error
            );
          }
        }
      );

      console.log(
        `📡 Subscribed to /topic/telemetry/${flightId}`
      );
    },

    onStompError: (frame) => {
      console.error(
        "❌ STOMP error:",
        frame.headers["message"]
      );

      console.error(frame.body);
    },

    onWebSocketError: (error) => {
      console.error(
        "❌ WebSocket error:",
        error
      );
    },

    onWebSocketClose: () => {
      console.log(
        "🔌 WebSocket disconnected"
      );
    },
  });

  // Store same instance globally
  stompClient = client;

  client.activate();

  return client;
};

export const sendTelemetry = (
  flightId,
  telemetry
) => {
  if (!stompClient?.connected) {
    console.warn(
      "⚠️ WebSocket is not connected."
    );

    return false;
  }

  stompClient.publish({
    destination: `/app/telemetry/${flightId}`,

    body: JSON.stringify(telemetry),
  });

  return true;
};

export const disconnectTelemetryWebSocket =
  async () => {
    const client = stompClient;

    // Clear only the current global reference
    stompClient = null;

    if (client) {
      await client.deactivate();

      console.log(
        "🔌 WebSocket connection closed."
      );
    }
  };

export const isTelemetryConnected = () => {
  return Boolean(stompClient?.connected);
};