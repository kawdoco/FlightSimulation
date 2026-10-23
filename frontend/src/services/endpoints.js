// Set VITE_BACKEND_URL to the public backend origin for each deployment.
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "http://localhost:8081").replace(/\/$/, "");
export const API_BASE_URL = `${BACKEND_URL}/api`;
export const WS_URL = `${BACKEND_URL.replace(/^http/, "ws")}/ws`;
