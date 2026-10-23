import { API_BASE_URL } from "./endpoints";
import axios from "axios";

const API_URL = `${API_BASE_URL}/flights`;

export const getFlightHistory = async ({
  aircraftId,
  status,
  start,
  end,
} = {}) => {
  const params = {};

  if (aircraftId) {
    params.aircraftId = aircraftId;
  }

  if (status) {
    params.status = status;
  }

  if (start) {
    params.start = start;
  }

  if (end) {
    params.end = end;
  }

  const response = await axios.get(
    `${API_URL}/history`,
    {
      params,
    }
  );

  return response.data;
};