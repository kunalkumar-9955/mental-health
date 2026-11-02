import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id: string;
  email?: string;
  displayName: string;
  photoURL?: string;
  isAnonymous: boolean;
  profile?: any;
  wellness?: any;
  settings?: any;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  emotion?: {
    detected: string;
    score: number;
    intensity: string;
    breakdown?: Record<string, number>;
  };
  isCrisis?: boolean;
}

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  // Chat
  messages: Message[];
  currentSessionId: string | null;
  therapyMode: string;
  isTyping: boolean;
  isCrisisMode: boolean;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setCurrentSessionId: (id: string | null) => void;
  setTherapyMode: (mode: string) => void;
  setIsTyping: (typing: boolean) => void;
  setIsCrisisMode: (crisis: boolean) => void;
  clearChat: () => void;

  // Mood
  currentMood: number;
  setCurrentMood: (mood: number) => void;

  // UI
  darkMode: boolean;
  sidebarOpen: boolean;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Emotion
  currentEmotion: string;
  emotionScore: number;
  setCurrentEmotion: (emotion: string) => void;
  setEmotionScore: (score: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token });
        if (typeof window !== "undefined") {
          if (token) {
            localStorage.setItem("mindcare_token", token);
          } else {
            localStorage.removeItem("mindcare_token");
          }
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, messages: [], currentSessionId: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("mindcare_token");
          localStorage.removeItem("mindcare_user");
        }
      },

      // Chat
      messages: [],
      currentSessionId: null,
      therapyMode: "general",
      isTyping: false,
      isCrisisMode: false,
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      setMessages: (messages) => set({ messages }),
      setCurrentSessionId: (id) => set({ currentSessionId: id }),
      setTherapyMode: (mode) => set({ therapyMode: mode }),
      setIsTyping: (typing) => set({ isTyping: typing }),
      setIsCrisisMode: (crisis) => set({ isCrisisMode: crisis }),
      clearChat: () => set({ messages: [], currentSessionId: null, isCrisisMode: false }),

      // Mood
      currentMood: 5,
      setCurrentMood: (mood) => set({ currentMood: mood }),

      // UI
      darkMode: true,
      sidebarOpen: false,
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Emotion
      currentEmotion: "neutral",
      emotionScore: 0,
      setCurrentEmotion: (emotion) => set({ currentEmotion: emotion }),
      setEmotionScore: (score) => set({ emotionScore: score }),
    }),
    {
      name: "mindcare-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        darkMode: state.darkMode,
        therapyMode: state.therapyMode,
        currentMood: state.currentMood,
      }),
    }
  )
);
