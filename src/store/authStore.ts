// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AxiosError } from "axios";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthUser = {
  id: number;
  fio?: string;
  username?: string;
  telefon?: string;
  telegram_id?: string;
  lavozim?: string;
  lavozim_display?: string;
  boshqarma?: string;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string | null;
};

type LoginPayload = {
  username: string;
  password: string;
};

type RegisterPayload = Record<string, unknown>;

type AuthResponse = {
  user: AuthUser;
  access?: string;
  token?: string;
};

type MeResponse = AuthUser | { user: AuthUser };

type ApiErrorBody = {
  message?: string;
  detail?: string;
};

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginPayload) => Promise<AuthActionResult>;
  register: (userData: RegisterPayload) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateUser: (userData: Partial<AuthUser>) => void;
  clearError: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return (
    axiosError.response?.data?.message ??
    axiosError.response?.data?.detail ??
    axiosError.message ??
    fallback
  );
};

const extractToken = (data: AuthResponse): string => {
  const token = data.access ?? data.token;
  if (!token) throw new Error("Authentication token missing in response");
  return token;
};

const normalizeMeResponse = (data: MeResponse): AuthUser =>
  "user" in data ? data.user : data;

const persistAuthToken = (token: string) =>
  localStorage.setItem("auth_token", token);

const clearAuthToken = () => localStorage.removeItem("auth_token");

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<AuthResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials,
          );
          const token = extractToken(data);

          persistAuthToken(token);
          set({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message = getErrorMessage(error, "Login failed");
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post<AuthResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            userData,
          );
          const token = extractToken(data);

          persistAuthToken(token);
          set({
            user: data.user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const message = getErrorMessage(error, "Registration failed");
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
          // Swallow — we clear local state regardless
          console.error("[Auth] Logout endpoint error:", error);
        } finally {
          clearAuthToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchUser: async () => {
        const token = get().token ?? localStorage.getItem("auth_token");

        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get<MeResponse>(
            API_ENDPOINTS.USERS.PROFILE,
          );
          const user = normalizeMeResponse(data);

          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          clearAuthToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: getErrorMessage(error, "Failed to fetch user"),
          });
        }
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
