import assert from 'node:assert/strict';
import { Client } from '@stomp/stompjs';

const api = 'http://localhost:8081/api';
async function request(path, method = 'GET', body) {
  const response = await fetch(`${api}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`${method} ${path}: ${response.status} ${await response.text()}`);
  return response.json();
}

const aircraft = await request('/aircraft/3');
assert.equal(aircraft.registrationNumber, 'TEST-SUPABASE-20261014');
assert.equal(aircraft.status, 'AVAILABLE');
const flight = await request('/flights?aircraftId=3', 'POST', {
  flightNumber: `TEST-WS-${Date.now()}`,
  departure: 'Colombo (WebSocket Test)',
  destination: 'Kandy (WebSocket Test)',
});
let started = false;
let timeout;
const client = new Client({
  brokerURL: 'ws://localhost:8081/ws',
  reconnectDelay: 0,
  heartbeatIncoming: 0,
  heartbeatOutgoing: 0,
});
try {
  await request(`/flights/${flight.id}/start`, 'PUT');
  started = true;
  let resolveMessage;
  const received = new Promise(resolve => { resolveMessage = resolve; });
  const ready = new Promise((resolve, reject) => {
    client.onConnect = () => {
      client.subscribe(`/topic/telemetry/${flight.id}`, message => {
        resolveMessage(JSON.parse(message.body));
      });
      // Spring's simple broker does not acknowledge subscription receipts.
      resolve();
    };
    client.onStompError = frame => reject(new Error(frame.headers.message));
    client.onWebSocketError = () => reject(new Error('WebSocket connection failed'));
  });
  const deadline = new Promise((_, reject) => {
    timeout = setTimeout(() => reject(new Error('WebSocket verification timed out')), 15000);
  });
  client.activate();
  await Promise.race([ready, deadline]);
  const sample = { altitude: 250, speed: 65, pitch: 3, roll: 1, heading: 90, throttle: 60, fuel: 98 };
  const saved = await request(`/telemetry/${flight.id}`, 'POST', sample);
  const message = await Promise.race([received, deadline]);
  assert.equal(message.id, saved.id);
  assert.equal(message.flight.id, flight.id);
  for (const [key, value] of Object.entries(sample)) assert.equal(message[key], value);
  const records = await request(`/telemetry/${flight.id}`);
  assert.ok(records.some(record => record.id === saved.id));
  console.log(`PASS: flight ${flight.id}, telemetry ${saved.id}: REST save, STOMP delivery, and database read-back.`);
} finally {
  clearTimeout(timeout);
  await client.deactivate();
  if (started) {
    await request(`/flights/${flight.id}/complete`, 'PUT');
    assert.equal((await request('/aircraft/3')).status, 'AVAILABLE');
    console.log('Test flight completed; aircraft is AVAILABLE.');
  }
}
