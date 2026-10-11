import axios from "axios";

const defaultApiUrl = import.meta.env.PROD
  ? "https://api.mulberries.shop/api"
  : "http://localhost:5007/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mulberries_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mulberries_admin_token");
      localStorage.removeItem("mulberries_admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
