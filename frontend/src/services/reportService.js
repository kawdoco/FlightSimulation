import axios from "axios";

const API_URL = "http://localhost:8080/api/telemetry";

export const getTelemetryReport = async (flightId) => {
  const response = await axios.get(
    `${API_URL}/${flightId}`
  );

  return response.data;
};

export const getTelemetrySummary = async (flightId) => {
  const response = await axios.get(
    `${API_URL}/${flightId}/summary`
  );

  return response.data;
};

export const downloadTelemetryCsv = async (flightId) => {
  const response = await axios.get(
    `${API_URL}/${flightId}/export`,
    {
      responseType: "blob",
    }
  );

  const url = window.URL.createObjectURL(
    new Blob([response.data], {
      type: "text/csv",
    })
  );

  const link = document.createElement("a");

  link.href = url;
  link.setAttribute(
    "download",
    `flight-${flightId}-telemetry.csv`
  );

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};