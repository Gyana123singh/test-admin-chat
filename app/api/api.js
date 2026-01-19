import axios from "axios";

const api = axios.create({
  baseURL: "https://api.dilvoicechat.fun/api/payment",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
