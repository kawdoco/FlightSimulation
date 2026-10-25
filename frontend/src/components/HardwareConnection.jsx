import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/endpoints';
import { getAllFlights } from '../services/flightService';
import { useAccess } from '../access/RoleContext';

export default function HardwareConnection({ onFlightChange }) {
  const { role } = useAccess();
  const [status, setStatus] = useState(null);
  const [flights, setFlights] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const selectionVersion = useRef(0);
  useEffect(() => {
    let disposed = false;
    let timer;
    async function refresh() {
      const version = selectionVersion.current;
      try {
        const { data } = await axios.get(`${API_BASE_URL}/hardware`);
        if (!disposed && version === selectionVersion.current) {
          setStatus(data);
          if (Number.isSafeInteger(data.flightId) && data.flightId > 0) onFlightChange(data.flightId);
          setError('');
        }
      } catch { if (!disposed) setError('Hardware connection status unavailable. Check the backend connection.'); }
      if (!disposed) timer = setTimeout(refresh, 3000);
    }
    refresh();
    getAllFlights().then(data => { if (!disposed) setFlights(Array.isArray(data) ? data : []); }).catch(() => {});
    return () => { disposed = true; clearTimeout(timer); };
  }, [onFlightChange]);

  async function selectFlight(event) {
    selectionVersion.current++;
    setSaving(true);
    try {
      const { data } = await axios.put(`${API_BASE_URL}/hardware/flight`, { flightId: Number(event.target.value) });
      setStatus(data); onFlightChange(data.flightId); setError('');
    } catch { setError('Could not select the hardware flight. Please retry.'); }
    finally { setSaving(false); }
  }
  const live = status?.lastPacketAt && Date.now() - Date.parse(status.lastPacketAt) < 10000;
  return <section className="notice-card" aria-label="Hardware connection">
    <div>
      <strong>ESP32: {status?.serialEnabled === false ? 'serial input disabled' : live ? `receiving on ${status.port}` : status?.port && status.port !== 'disconnected' ? `connected on ${status.port}, waiting for packets` : 'searching for controller'}</strong>
      <p>Keep the controller connected by USB and close Serial Monitor. Both boards need the same Wi-Fi.</p>
      <label>Hardware flight{' '}
        <select aria-label="Hardware flight" value={status?.flightId ?? ''} disabled={saving || !status || !['ADMIN', 'OPERATOR'].includes(role)} onChange={selectFlight}>
          <option value="" disabled>Select flight</option>
          {status?.flightId && !flights.some(f => f.id === status.flightId) && <option value={status.flightId}>Flight {status.flightId}</option>}
          {flights.map(f => <option key={f.id} value={f.id}>{f.flightNumber} (#{f.id})</option>)}
        </select>
      </label>
      <p>Monitoring and recording use this flight. Selection applies to the connected controller for all users.</p>
      {status?.recording && <p>Recording: {status.recording.pending} samples awaiting storage.</p>}
      {status?.recording?.error && <p role="alert">{status.recording.error}</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  </section>;
}
