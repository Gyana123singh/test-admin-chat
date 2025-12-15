import axios from "axios";

const instanceApi = axios.create({
  baseURL: "http://localhost:5000",
});
instanceApi.interceptors.request.use((config => {
  const token = localStorage.getItem("adminAuthToken");
  if (token) {  
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}));

export default instanceApi;
