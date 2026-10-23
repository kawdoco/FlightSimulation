import { API_BASE_URL } from "./endpoints";
import axios from "axios";

const API_URL = `${API_BASE_URL}/telemetry`;

export const getTelemetryReport = async (flightId, page = 0) => {
  const response = await axios.get(
    `${API_URL}/${flightId}/history`, { params: { page, size: 100 } }
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
      timeout: 300000,
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

