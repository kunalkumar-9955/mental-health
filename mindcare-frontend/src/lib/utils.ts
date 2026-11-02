import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (date: Date | string) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getMoodColor = (mood: number) => {
  if (mood >= 8) return "#22C55E";
  if (mood >= 6) return "#84CC16";
  if (mood >= 4) return "#EAB308";
  if (mood >= 2) return "#F97316";
  return "#EF4444";
};

export const getMoodEmoji = (mood: number) => {
  if (mood >= 9) return "😄";
  if (mood >= 7) return "😊";
  if (mood >= 5) return "😐";
  if (mood >= 3) return "😔";
  return "😢";
};

export const getEmotionColor = (emotion: string) => {
  const colors: Record<string, string> = {
    happiness: "#22C55E",
    sadness: "#3B82F6",
    anxiety: "#F59E0B",
    stress: "#F97316",
    anger: "#EF4444",
    loneliness: "#8B5CF6",
    neutral: "#6B7280",
    supportive: "#06B6D4",
  };
  return colors[emotion] || "#6B7280";
};

export const getEmotionEmoji = (emotion: string) => {
  const emojis: Record<string, string> = {
    happiness: "😊",
    sadness: "😢",
    anxiety: "😰",
    stress: "😤",
    anger: "😠",
    loneliness: "😔",
    neutral: "😐",
    supportive: "💙",
  };
  return emojis[emotion] || "😐";
};

export const THERAPY_MODES = [
  { id: "general", name: "General Support", icon: "💬", color: "purple" },
  { id: "student_stress", name: "Student Stress", icon: "📚", color: "blue" },
  { id: "anxiety_relief", name: "Anxiety Relief", icon: "🌊", color: "cyan" },
  { id: "depression_support", name: "Depression Support", icon: "🌱", color: "green" },
  { id: "relationship", name: "Relationship Support", icon: "💝", color: "pink" },
  { id: "motivation", name: "Motivation Mode", icon: "⚡", color: "yellow" },
  { id: "sleep_therapy", name: "Sleep Therapy", icon: "🌙", color: "indigo" },
  { id: "panic_attack", name: "Panic Attack Support", icon: "🆘", color: "red" },
  { id: "meditation", name: "Meditation Companion", icon: "🧘", color: "teal" },
];

export const WELLNESS_BADGES = [
  { id: "first_chat", name: "First Step", icon: "🌟", description: "Started your first therapy session" },
  { id: "week_streak", name: "Week Warrior", icon: "🔥", description: "7-day check-in streak" },
  { id: "mood_tracker", name: "Mood Master", icon: "📊", description: "Logged mood 30 times" },
  { id: "meditation_10", name: "Zen Seeker", icon: "🧘", description: "Completed 10 meditation sessions" },
  { id: "journal_5", name: "Reflector", icon: "📝", description: "Written 5 journal entries" },
  { id: "breathing_pro", name: "Breath Master", icon: "💨", description: "Completed 20 breathing exercises" },
];
