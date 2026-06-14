import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

export const apiUrl = (path) => {
  if (!path) return apiBaseUrl;
  return `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true 
});