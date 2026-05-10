import axios from "axios";

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api/v1', // Update this based on your backend URL
// });
const api = axios.create({
  baseURL: 'https://backend-pro-seven.vercel.app/api/v1', // Update this based on your backend URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

export default api;