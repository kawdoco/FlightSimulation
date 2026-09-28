import axios from "axios";

const API_URL = "http://localhost:8081/api/flights";

export const getAllFlights = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getFlightById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createFlight = async (flight, aircraftId) => {
  const response = await axios.post(
    `${API_URL}?aircraftId=${aircraftId}`,
    flight
  );

  return response.data;
};

export const updateFlight = async (
  id,
  flight,
  aircraftId
) => {
  const response = await axios.put(
    `${API_URL}/${id}?aircraftId=${aircraftId}`,
    flight
  );

  return response.data;
};

export const startFlight = async (id) => {
  const response = await axios.put(
    `${API_URL}/${id}/start`
  );

  return response.data;
};

export const completeFlight = async (id) => {
  const response = await axios.put(
    `${API_URL}/${id}/complete`
  );

  return response.data;
};

export const cancelFlight = async (id) => {
  const response = await axios.put(
    `${API_URL}/${id}/cancel`
  );

  return response.data;
};

export const deleteFlight = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};