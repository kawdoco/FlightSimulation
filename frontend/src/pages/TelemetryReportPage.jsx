import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { downloadTelemetryCsv, getTelemetryReport, getTelemetrySummary } from '../services/reportService';
import { getFlightById } from '../services/flightService';
import Icon from '../components/Icon';

export default function TelemetryReportPage() {
  const { flightId } = useParams();
  const [historyPage, setHistoryPage] = useState({ flightId, page: 0 });
  const page = historyPage.flightId === flightId ? historyPage.page : 0;
  const [hasNext, setHasNext] = useState(false);
  const [summary, setSummary] = useState(null);
  const [flight, setFlight] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let disposed = false;
    setLoading(true);
    setError('');
    setSummary(null);
    setFlight(null);
    setTelemetry([]);
    Promise.all([getTelemetrySummary(flightId), getTelemetryReport(flightId, page), getFlightById(flightId)])
      .then(([summaryData, records, flightData]) => {
        if (disposed) return;
        setSummary(summaryData);
        setTelemetry(records.content); setHasNext(records.hasNext);
        setFlight(flightData);
      })
      .catch(() => { if (!disposed) setError('Unable to load telemetry report. Please try again.'); })
      .finally(() => { if (!disposed) setLoading(false); });
    return () => { disposed = true; };
  }, [flightId, page]);

  const exportCsv = async () => {
    setExporting(true);
    setError('');
    try { await downloadTelemetryCsv(flightId); }
    catch { setError('Unable to export telemetry. Please try again.'); }
    finally { setExporting(false); }
  };
  const metrics = summary ? [
    ['Record count', summary.recordCount, ''],
    ['Average altitude', Number(summary.averageAltitude).toFixed(1), 'ft'],
    ['Max altitude', Number(summary.maxAltitude).toFixed(0), 'ft'],
    ['Average speed', Number(summary.averageSpeed).toFixed(1), 'km/h'],
    ['Max speed', Number(summary.maxSpeed).toFixed(0), 'km/h'],
    ['Minimum fuel', Number(summary.minimumFuel).toFixed(1), '%'],
  ] : [];
  return <div className="page-container">
    <div className="page-header"><div><h1>Telemetry Report</h1><Link className="back-link" to="/history"><Icon name="back" size={16} />Back to reports</Link></div><button className="primary-btn export-button" type="button" onClick={exportCsv} disabled={loading || !summary || exporting}><Icon name="download" size={17} />{exporting ? 'Exporting…' : 'Export CSV'}</button></div>
    {loading && <div className="empty-state" role="status">Loading report…</div>}
    {error && <p className="error-message" role="alert">{error}</p>}
    {summary && <>
      <div className="report-banner"><h2>{summary.flightNumber}</h2><span className={`aircraft-status ${summary.status.toLowerCase().replaceAll('_', '-')}`}>{summary.status.replaceAll('_', ' ')}</span><p>Aircraft: {flight?.aircraft?.registrationNumber ?? '—'} · Route: {flight?.departure} → {flight?.destination} · Flight ID: {summary.flightId}</p><p>Started: {flight?.startTime ? new Date(flight.startTime).toLocaleString() : 'Not started'} · Completed: {flight?.endTime ? new Date(flight.endTime).toLocaleString() : 'Not completed'}</p></div>
      <div className="summary-grid">{metrics.map(([title, value, unit]) => <div className="summary-card" key={title}><h3>{title}</h3><p>{value} <small>{unit}</small></p></div>)}</div>
      <h2>Telemetry History</h2>
      <nav aria-label="Telemetry history pages"><button disabled={loading || page === 0} onClick={() => setHistoryPage({flightId,page:page-1})}>Previous</button> <span>Page {page+1}</span> <button disabled={loading || !hasNext} onClick={() => setHistoryPage({flightId,page:page+1})}>Next</button></nav>
      {telemetry.length === 0 ? <div className="empty-state">No telemetry recorded for this flight.</div> : <div className="table-wrapper"><table>
        <thead><tr>{['Time', 'Altitude (ft)', 'Speed (km/h)', 'Pitch (°)', 'Roll (°)', 'Heading (°)', 'Throttle (%)', 'Fuel (%)'].map(title => <th key={title} scope="col">{title}</th>)}</tr></thead>
        <tbody>{telemetry.map(item => <tr key={item.id}><td>{item.recordedAt ? new Date(item.recordedAt).toLocaleString() : '—'}</td>{['altitude', 'speed', 'pitch', 'roll', 'heading', 'throttle', 'fuel'].map(field => <td key={field}>{Number(item[field]).toFixed(1)}</td>)}</tr>)}</tbody>
      </table></div>}
    </>}
  </div>;
}

