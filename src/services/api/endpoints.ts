// src/services/api/endpoints.js
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout/",
    REFRESH: "/auth/token/refresh",
  },

  // Users
  USERS: {
    LIST: "/auth/users/",
    CREATE: "/auth/users/",
    DETAIL: (id: string | number) => `/users/${id}/`,
    UPDATE: (id: string | number) => `/users/${id}/`,
    DELETE: (id: string | number) => `/users/${id}/`,
    PROFILE: "/auth/profile/",
    CHANGE_PASSWORD: "/auth/password/change/",
  },
  DASHBOARD: {
    STATS: "/analytics/dashboard/",
  },

  BOSHQARMA: {
    LIST: "/core/boshqarmalar/",
  },
  HUJJATLAR: {
    LIST: "/hujjatlar/",
  },
  OBYEKTLAR: {
    LIST: "/obyektlar/",
    STATISTIKA: "/obyektlar/statistika/",
  },
  BAYONNOMALAR: {
    LIST: "/bayonnomalar/",
  },
  TOPSHIRIQLAR: {
    LIST: "/bayonnomalar/topshiriqlar/",
  },
  JARIMALAR: {
    LIST: "/jarimalar/",
    STATISTIKA: "/jarimalar/boshqarma_statistika/",
  },
  CHAT_XONALAR: {
    LIST: "/chat_xonalar/",
  }
};
