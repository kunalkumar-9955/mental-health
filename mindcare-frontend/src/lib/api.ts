import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("mindcare_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 — token expired, redirect to login
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("mindcare_token");
        localStorage.removeItem("mindcare_user");
        // Only redirect if not already on auth page
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth";
        }
      }
    }

    // 503 — DB not connected, attach a friendly message
    if (error.response?.status === 503) {
      const data = error.response.data;
      error.message = data?.fix
        ? `Database not connected. ${data.fix}`
        : "Database not connected. Whitelist your IP in MongoDB Atlas → Network Access → 0.0.0.0/0";
    }

    // Network error — backend not running
    if (!error.response && (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED")) {
      error.message = "Backend server is not running. Run: cd mindcare-backend && npm run dev";
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data: { email: string; password: string; displayName?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  anonymous: () => api.post("/auth/anonymous"),
  firebase: (data: { firebaseUid: string; email?: string; displayName?: string; photoURL?: string }) =>
    api.post("/auth/firebase", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data: any) => api.put("/auth/profile", data),
  deleteAccount: () => api.delete("/auth/account"),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
};

// Chat APIs
export const chatAPI = {
  sendMessage: (data: { message: string; sessionId?: string; therapyMode?: string }) =>
    api.post("/chat/message", data),
  getSessions: () => api.get("/chat/sessions"),
  getSession: (sessionId: string) => api.get(`/chat/sessions/${sessionId}`),
  deleteSession: (sessionId: string) => api.delete(`/chat/sessions/${sessionId}`),
  deleteAllSessions: () => api.delete("/chat/sessions"),
  exportSession: (sessionId: string) => api.get(`/chat/sessions/${sessionId}/export`),
};

// Emotion APIs
export const emotionAPI = {
  analyze: (text: string) => api.post("/emotion/analyze", { text }),
};

// Mood APIs
export const moodAPI = {
  log: (data: any) => api.post("/mood/log", data),
  getHistory: (days?: number) => api.get(`/mood/history?days=${days || 30}`),
  getAnalytics: (days?: number) => api.get(`/mood/analytics?days=${days || 30}`),
  getToday: () => api.get("/mood/today"),
};

// Therapy APIs
export const therapyAPI = {
  getModes: () => api.get("/therapy/modes"),
  logSession: (data: any) => api.post("/therapy/session", data),
  getQuote: () => api.get("/therapy/quote"),
  getBreathing: () => api.get("/therapy/breathing"),
};

// Analytics APIs
export const analyticsAPI = {
  getDashboard: () => api.get("/analytics/dashboard"),
  getEmotionalScore: () => api.get("/analytics/emotional-score"),
};

// Crisis APIs
export const crisisAPI = {
  getResources: () => api.get("/crisis/resources"),
  resolveAlert: (alertId: string) => api.post(`/crisis/resolve/${alertId}`),
  getHistory: () => api.get("/crisis/history"),
};

// Journal APIs
export const journalAPI = {
  create: (data: any) => api.post("/journal", data),
  getAll: (page?: number) => api.get(`/journal?page=${page || 1}`),
  getOne: (id: string) => api.get(`/journal/${id}`),
  delete: (id: string) => api.delete(`/journal/${id}`),
};

// Voice APIs
export const voiceAPI = {
  analyze: (formData: FormData) =>
    api.post("/voice/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// Notification APIs
export const notificationAPI = {
  getMotivation: () => api.get("/notifications/motivation"),
  getReminders: () => api.get("/notifications/reminders"),
};

export default api;

// Companion APIs
export const companionAPI = {
  getProfile: () => api.get("/companion/profile"),
  updatePersonality: (data: { personality: string; friendName?: string }) => api.put("/companion/personality", data),
  chat: (data: { message: string; sessionMessages?: any[] }) => api.post("/companion/chat", data),
  checkIn: (data: { mood: number; note?: string }) => api.post("/companion/checkin", data),
  getPersonalities: () => api.get("/companion/personalities"),
};

// Wellness Score APIs
export const wellnessAPI = {
  calculate: () => api.post("/wellness/calculate", {}),
  getLatest: () => api.get("/wellness/latest"),
  getHistory: () => api.get("/wellness/history"),
  getReport: () => api.get("/wellness/report"),
};

// Dreams APIs
export const dreamsAPI = {
  analyze: (data: { title?: string; description: string; type?: string; moodBefore?: number }) => api.post("/dreams", data),
  getAll: () => api.get("/dreams"),
  delete: (id: string) => api.delete(`/dreams/${id}`),
};

// Therapists APIs
export const therapistsAPI = {
  getAll: (params?: { specialization?: string; language?: string; maxPrice?: number; sort?: string }) =>
    api.get("/therapists", { params }),
  getOne: (id: string) => api.get(`/therapists/${id}`),
  book: (id: string, data: { date: string; slot: string; type?: string }) => api.post(`/therapists/${id}/book`, data),
};

// Music APIs
export const musicAPI = {
  recommend: (emotion: string) => api.get(`/music/recommend/${emotion}`),
  getCategories: () => api.get("/music/categories"),
  getCategory: (category: string) => api.get(`/music/category/${category}`),
};
