import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getFlightHistory } from "../services/historyService.js";
import { getAllAircraft } from "../services/aircraftService.js";

function FlightHistoryPage() {
  const navigate = useNavigate();

  const [flights, setFlights] = useState([]);
  const [aircraft, setAircraft] = useState([]);

  const [aircraftId, setAircraftId] = useState("");
  const [status, setStatus] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAircraft();
    loadHistory();
  }, []);

  const loadAircraft = async () => {
    try {
      const data = await getAllAircraft();
      setAircraft(data);
    } catch (err) {
      console.error("Aircraft load error:", err);
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getFlightHistory({
        aircraftId: aircraftId || undefined,
        status: status || undefined,
        start: start ? `${start}T00:00:00` : undefined,
        end: end ? `${end}T23:59:59` : undefined,
      });

      setFlights(data);
    } catch (err) {
      console.error("History load error:", err);
      setError("Unable to load flight history.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setAircraftId("");
    setStatus("");
    setStart("");
    setEnd("");

    try {
      setLoading(true);
      setError("");

      const data = await getFlightHistory();
      setFlights(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load flight history.");
    } finally {
      setLoading(false);
    }
  };

  const openReport = (flightId) => {
    navigate(`/reports/${flightId}`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Flight History</h1>
          <p>Find flight records and download telemetry reports.</p>
        </div>
      </div>

      <div className="history-filters">
        <div className="filter-group">
          <label htmlFor="history-aircraft">Aircraft</label>

          <select
            id="history-aircraft"
            value={aircraftId}
            onChange={(e) => setAircraftId(e.target.value)}
          >
            <option value="">All Aircraft</option>

            {aircraft.map((item) => (
              <option key={item.id} value={item.id}>
                {item.registrationNumber} - {item.model}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="history-status">Status</label>

          <select
            id="history-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="history-start">From Date</label>

          <input
            id="history-start"
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="history-end">To Date</label>

          <input
            id="history-end"
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button type="button" onClick={loadHistory} disabled={loading}>
            Apply filters
          </button>

          <button type="button" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {loading && <p>Loading flight history...</p>}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {!loading && !error && flights.length === 0 && (
        <p>No flights found for the selected filters.</p>
      )}

      {!loading && flights.length > 0 && (
        <div className="table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Flight</th>
                <th>Aircraft</th>
                <th>Route</th>
                <th>Status</th>
                <th>Report</th>
              </tr>
            </thead>

            <tbody>
              {flights.map((flight) => (
                <tr key={flight.id}>
                  <td>{flight.flightNumber}<small className="row-details">{flight.scheduledTime ? new Date(flight.scheduledTime).toLocaleString() : 'Not scheduled'}</small></td>

                  <td>
                    {flight.aircraft?.registrationNumber || "-"}
                  </td>

                  <td>{flight.departure} → {flight.destination}</td>
                  <td><span className={`aircraft-status ${flight.status.toLowerCase().replaceAll('_', '-')}`}>{flight.status.replaceAll('_', ' ')}</span></td>

                  <td>
                    <button
                      type="button"
                      onClick={() => openReport(flight.id)}
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FlightHistoryPage;
