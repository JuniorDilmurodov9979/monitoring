// src/services/api/axios.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/authStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

// ─── Instance ─────────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL:
    import.meta.env.VITE_APP_BASE_URL ??
    "https://loyiha.kuprikqurilish.uz/api/v1",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Token refresh state ───────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(error),
  );
  failedQueue = [];
};

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      useAuthStore.getState().token ?? localStorage.getItem("auth_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // ── 401 handling ──────────────────────────────────────────────────────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refreshToken, logout } = useAuthStore.getState();

      // If a refresh endpoint exists, attempt token refresh
      if (refreshToken) {
        if (isRefreshing) {
          // Queue requests that arrive while refresh is in-flight
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers = {
                ...originalRequest.headers,
                Authorization: `Bearer ${token}`,
              };
              return api(originalRequest);
            })
            .catch(Promise.reject.bind(Promise));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshToken(); // implement in authStore
          processQueue(null, newToken);
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          void logout();
          redirectToLogin();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // No refresh token — log out immediately
      void logout();
      redirectToLogin();
    }

    // ── Other error status codes ──────────────────────────────────────────────
    if (error.response?.status === 403) {
      console.warn("[API] Forbidden — insufficient permissions.");
    }

    if (error.response?.status && error.response.status >= 500) {
      console.error("[API] Server error:", error.response.status);
    }

    return Promise.reject(error);
  },
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function redirectToLogin() {
  if (window.location.pathname !== "/auth/login") {
    window.location.href = "/auth/login";
  }
}

export default api;