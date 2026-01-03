import axios from "axios";

// Use environment variable in production, localhost in development
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL}/api`
    : "http://localhost:3000/api",
  withCredentials: true,
});

export default API;