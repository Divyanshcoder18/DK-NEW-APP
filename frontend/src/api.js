import axios from "axios";

// For single-service deployment: use relative paths (production) or localhost (development)
const API = axios.create({
  baseURL: import.meta.env.DEV ? "http://localhost:3000/api" : "/api",
  withCredentials: true,
});

export default API;