import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  downloadTelemetryCsv,
  getTelemetryReport,
  getTelemetrySummary,
} from "../services/reportService";

function TelemetryReportPage() {

  const { flightId } = useParams();

  const navigate = useNavigate();

  const [summary, setSummary] =
    useState(null);

  const [telemetry, setTelemetry] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    loadReport();

  }, [flightId]);

  const loadReport = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        summaryData,
        telemetryData,
      ] = await Promise.all([
        getTelemetrySummary(flightId),
        getTelemetryReport(flightId),
      ]);

      setSummary(summaryData);
      setTelemetry(telemetryData);

    } catch (error) {

      console.error(error);

      setError(
        "Unable to load telemetry report."
      );

    } finally {

      setLoading(false);

    }

  };

  const exportCsv = async () => {

    try {

      await downloadTelemetryCsv(
        flightId
      );

    } catch (error) {

      console.error(error);

      setError(
        "Unable to export telemetry."
      );

    }

  };

  if (loading) {

    return (
      <div className="page-container">
        <p>Loading report...</p>
      </div>
    );

  }

  return (

    <div className="page-container">

      <button
        onClick={() =>
          navigate("/history")
        }
      >
        Back to History
      </button>

      <h1>Telemetry Report</h1>

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {summary && (

        <>

          <h2>
            {summary.flightNumber}
          </h2>

          <p>
            Flight ID: {summary.flightId}
          </p>

          <p>
            Status: {summary.status}
          </p>

          <div className="summary-grid">

            <div className="summary-card">

              <h3>
                Records
              </h3>

              <p>
                {summary.recordCount}
              </p>

            </div>

            <div className="summary-card">

              <h3>
                Average Altitude
              </h3>

              <p>
                {Number(
                  summary.averageAltitude
                ).toFixed(2)}
              </p>

            </div>

            <div className="summary-card">

              <h3>
                Maximum Altitude
              </h3>

              <p>
                {Number(
                  summary.maxAltitude
                ).toFixed(2)}
              </p>

            </div>

            <div className="summary-card">

              <h3>
                Average Speed
              </h3>

              <p>
                {Number(
                  summary.averageSpeed
                ).toFixed(2)}
              </p>

            </div>

            <div className="summary-card">

              <h3>
                Maximum Speed
              </h3>

              <p>
                {Number(
                  summary.maxSpeed
                ).toFixed(2)}
              </p>

            </div>

            <div className="summary-card">

              <h3>
                Minimum Fuel
              </h3>

              <p>
                {Number(
                  summary.minimumFuel
                ).toFixed(2)}
                %
              </p>

            </div>

          </div>

          <button onClick={exportCsv}>
            Export CSV
          </button>

        </>

      )}

      <h2>Telemetry History</h2>

      {telemetry.length === 0 ? (

        <p>
          No telemetry recorded for this flight.
        </p>

      ) : (

        <div className="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>Time</th>
                <th>Altitude</th>
                <th>Speed</th>
                <th>Pitch</th>
                <th>Roll</th>
                <th>Heading</th>
                <th>Throttle</th>
                <th>Fuel</th>
              </tr>

            </thead>

            <tbody>

              {telemetry.map((item) => (

                <tr key={item.id}>

                  <td>
                    {item.recordedAt
                      ? new Date(
                          item.recordedAt
                        ).toLocaleString()
                      : "-"}
                  </td>

                  <td>
                    {item.altitude}
                  </td>

                  <td>
                    {item.speed}
                  </td>

                  <td>
                    {item.pitch}
                  </td>

                  <td>
                    {item.roll}
                  </td>

                  <td>
                    {item.heading}
                  </td>

                  <td>
                    {item.throttle}
                  </td>

                  <td>
                    {item.fuel}
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

export default TelemetryReportPage;