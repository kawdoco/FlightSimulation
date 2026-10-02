import axios from "axios";

<<<<<<< HEAD
const API_URL = "http://localhost:8080/api/aircraft";
=======
const API_URL = "http://localhost:8081/api/aircraft";
>>>>>>> origin/develop

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