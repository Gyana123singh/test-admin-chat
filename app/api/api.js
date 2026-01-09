import axios from "axios";

const api = axios.create({
  baseURL: "https://chat-app-1-qvl9.onrender.com/api/payment",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
