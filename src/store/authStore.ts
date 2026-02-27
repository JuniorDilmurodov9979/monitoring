import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AxiosError } from "axios";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

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

type LoginResponse = {
  user: AuthUser;
  access?: string;
  token?: string;
};

type RegisterResponse = {
  user: AuthUser;
  access?: string;
  token?: string;
};

type MeResponse = AuthUser | { user: AuthUser };

type ApiErrorBody = {
  message?: string;
  detail?: string;
};

type AuthActionResult = {
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

const getErrorMessage = (error: unknown, fallback: string) => {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.detail ||
    axiosError.message ||
    fallback
  );
};

const normalizeMeUser = (data: MeResponse): AuthUser => {
  if ("user" in data) {
    return data.user;
  }

  return data;
};

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
          const response = await api.post<LoginResponse>(
            API_ENDPOINTS.AUTH.LOGIN,
            credentials,
          );
          const { user, access, token } = response.data;
          const authToken = access ?? token;

          if (!authToken) {
            throw new Error("Authentication token is missing");
          }

          localStorage.setItem("auth_token", authToken);
          set({
            user,
            token: authToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = getErrorMessage(error, "Login failed");
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<RegisterResponse>(
            API_ENDPOINTS.AUTH.REGISTER,
            userData,
          );
          const { user, access, token } = response.data;
          const authToken = access ?? token;

          if (!authToken) {
            throw new Error("Authentication token is missing");
          }

          localStorage.setItem("auth_token", authToken);
          set({
            user,
            token: authToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = getErrorMessage(error, "Registration failed");
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          localStorage.removeItem("auth_token");
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
        const token = get().token || localStorage.getItem("auth_token");
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await api.get<MeResponse>(
            API_ENDPOINTS.USERS.PROFILE,
          );
          const user = normalizeMeUser(response.data);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          localStorage.removeItem("auth_token");
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
          user: state.user ? { ...state.user, ...userData } : state.user,
        }));
      },

      clearError: () => {
        set({ error: null });
      },
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
