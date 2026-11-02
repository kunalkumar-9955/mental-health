"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";

interface AIAvatarProps {
  size?: "small" | "medium" | "large";
  mood?: "calm" | "happy" | "concerned" | "supportive";
  isTyping?: boolean;
}

const moodColors = {
  calm: { from: "#7C3AED", to: "#06B6D4" },
  happy: { from: "#22C55E", to: "#06B6D4" },
  concerned: { from: "#F59E0B", to: "#EF4444" },
  supportive: { from: "#7C3AED", to: "#EC4899" },
};

const moodExpressions = {
  calm: "😌",
  happy: "😊",
  concerned: "🤔",
  supportive: "💙",
};

export default function AIAvatar({ size = "medium", mood = "calm", isTyping = false }: AIAvatarProps) {
  const sizes = {
    small: { container: 48, inner: 36, emoji: "text-lg" },
    medium: { container: 80, inner: 60, emoji: "text-2xl" },
    large: { container: 160, inner: 120, emoji: "text-5xl" },
  };

  const s = sizes[size];
  const colors = moodColors[mood];

  return (
    <div className="relative flex items-center justify-center" style={{ width: s.container, height: s.container }}>
      {/* Outer aura rings */}
      {size === "large" && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: s.container + 40,
              height: s.container + 40,
              background: `radial-gradient(circle, ${colors.from}20 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full border"
            style={{
              width: s.container + 20,
              height: s.container + 20,
              borderColor: `${colors.from}30`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </>
      )}

      {/* Spinning gradient ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: s.container,
          height: s.container,
          background: `conic-gradient(from 0deg, ${colors.from}, ${colors.to}, ${colors.from})`,
          padding: "2px",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Inner circle */}
      <motion.div
        className="relative rounded-full flex items-center justify-center z-10"
        style={{
          width: s.inner,
          height: s.inner,
          background: `linear-gradient(135deg, ${colors.from}40, ${colors.to}30)`,
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        animate={isTyping ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {size === "large" ? (
          <div className="flex flex-col items-center gap-1">
            <Brain className="w-10 h-10 text-white" />
            <span className={s.emoji}>{moodExpressions[mood]}</span>
          </div>
        ) : size === "medium" ? (
          <Brain className="w-7 h-7 text-white" />
        ) : (
          <Brain className="w-5 h-5 text-white" />
        )}
      </motion.div>

      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute -bottom-6 flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-400"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
