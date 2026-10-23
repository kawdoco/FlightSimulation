import { getAuthorization, expireSession } from './authSession';
import { API_BASE_URL, WS_URL } from "./endpoints";
import { Client } from "@stomp/stompjs";

const API_URL = `${API_BASE_URL}/telemetry`;

let stompClient = null;

export const connectTelemetryWebSocket = (
  onTelemetryReceived,
  flightId = 1
) => {
  if (stompClient?.active) {
    return stompClient;
  }

  const client = new Client({
    brokerURL: WS_URL,
    beforeConnect: () => { client.connectHeaders = { Authorization: getAuthorization() }; },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    onConnect: () => {
      console.log("Connected to telemetry WebSocket");

      client.subscribe(
        `/topic/telemetry/${flightId}`,
        (message) => {
          let telemetry;

          try {
            telemetry = JSON.parse(message.body);
          } catch (error) {
            console.error("Invalid telemetry JSON:", error);
            return;
          }

          if (typeof onTelemetryReceived === "function") {
            onTelemetryReceived(telemetry);
          }
        }
      );
    },

    onStompError: (frame) => {
      console.error(
        "STOMP error:",
        frame.headers["message"],
        frame.body
      );
    },

    onWebSocketError: (error) => {
      console.error("WebSocket error:", error);
    },

    onWebSocketClose: () => {
      console.log("Telemetry WebSocket disconnected");
    },
  });

  stompClient = client;
  client.activate();

  return client;
};

// Use the backend's existing REST endpoint.
// The backend saves the telemetry and broadcasts it over STOMP.
export const sendTelemetry = async (flightId, telemetry) => {
  const sentAuthorization = getAuthorization();
  const response = await fetch(`${API_URL}/${flightId}`, {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: {
      "Content-Type": "application/json", Authorization: sentAuthorization,
    },
    body: JSON.stringify(telemetry),
  });

  if (response.status === 401) expireSession(sentAuthorization);
  if (!response.ok) {
    throw new Error(
      `Failed to save telemetry: HTTP ${response.status}`
    );
  }

  return response.json();
};

export const disconnectTelemetryWebSocket = async () => {
  const client = stompClient;
  stompClient = null;

  if (client) {
    await client.deactivate();
  }
};

export const isTelemetryConnected = () => {
  return Boolean(stompClient?.connected);
};


