// src/services/api/axios.ts
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
// VITE_APP_BASE_URL real API
const api = axios.create({
  baseURL: "https://loyiha.kuprikqurilish.uz/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      useAuthStore.getState().token || localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState();
      void logout();

      // IMPORTANT: prevent infinite redirect loop
      if (window.location.pathname !== "/auth/login") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
