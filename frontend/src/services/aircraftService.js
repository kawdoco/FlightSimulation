import axios from "axios";

const API_URL = "http://localhost:8080/api/aircraft";

export const getAllAircraft = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getAircraftById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createAircraft = async (aircraft) => {
  const response = await axios.post(API_URL, aircraft);
  return response.data;
};

export const updateAircraft = async (id, aircraft) => {
  const response = await axios.put(`${API_URL}/${id}`, aircraft);
  return response.data;
};

export const deleteAircraft = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};