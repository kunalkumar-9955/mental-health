"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingCircleProps {
  size?: "small" | "medium" | "large";
  autoPlay?: boolean;
  onComplete?: () => void;
}

const PHASES = [
  { label: "Inhale", duration: 4, scale: 1.4 },
  { label: "Hold", duration: 4, scale: 1.4 },
  { label: "Exhale", duration: 4, scale: 1 },
  { label: "Hold", duration: 2, scale: 1 },
];

export default function BreathingCircle({ size = "medium", autoPlay = true, onComplete }: BreathingCircleProps) {
  const [phase, setPhase] = useState(0);
  const [isActive, setIsActive] = useState(autoPlay);
  const [cycles, setCycles] = useState(0);

  const sizes = {
    small: { outer: 80, inner: 50, text: "text-xs" },
    medium: { outer: 160, inner: 100, text: "text-sm" },
    large: { outer: 240, inner: 150, text: "text-base" },
  };

  const s = sizes[size];

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      const nextPhase = (phase + 1) % PHASES.length;
      setPhase(nextPhase);
      if (nextPhase === 0) {
        const newCycles = cycles + 1;
        setCycles(newCycles);
        if (newCycles >= 4 && onComplete) {
          onComplete();
          setIsActive(false);
        }
      }
    }, PHASES[phase].duration * 1000);

    return () => clearTimeout(timer);
  }, [phase, isActive, cycles, onComplete]);

  const currentPhase = PHASES[phase];

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative flex items-center justify-center cursor-pointer"
        style={{ width: s.outer, height: s.outer }}
        onClick={() => setIsActive(!isActive)}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: s.outer,
            height: s.outer,
            background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
          }}
          animate={{ scale: isActive ? [1, 1.2, 1] : 1 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main breathing circle */}
        <motion.div
          className="rounded-full flex items-center justify-center"
          style={{
            width: s.inner,
            height: s.inner,
            background: "radial-gradient(circle, rgba(124,58,237,0.6) 0%, rgba(6,182,212,0.3) 60%, transparent 100%)",
            boxShadow: "0 0 30px rgba(124,58,237,0.4)",
          }}
          animate={{
            scale: isActive ? currentPhase.scale : 1,
          }}
          transition={{
            duration: currentPhase.duration,
            ease: "easeInOut",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`text-white font-semibold ${s.text} text-center`}
            >
              {isActive ? currentPhase.label : "Tap"}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Progress ring */}
        {isActive && (
          <svg
            className="absolute"
            style={{ width: s.outer, height: s.outer }}
            viewBox={`0 0 ${s.outer} ${s.outer}`}
          >
            <circle
              cx={s.outer / 2}
              cy={s.outer / 2}
              r={s.outer / 2 - 4}
              fill="none"
              stroke="rgba(124,58,237,0.2)"
              strokeWidth="2"
            />
            <motion.circle
              cx={s.outer / 2}
              cy={s.outer / 2}
              r={s.outer / 2 - 4}
              fill="none"
              stroke="rgba(124,58,237,0.8)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * (s.outer - 8)}`}
              initial={{ strokeDashoffset: Math.PI * (s.outer - 8) }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: currentPhase.duration, ease: "linear" }}
              style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
            />
          </svg>
        )}
      </div>

      {size !== "small" && (
        <div className="text-center">
          <p className="text-white/60 text-xs">
            {isActive ? `Cycle ${cycles + 1} of 4` : "Tap to start breathing exercise"}
          </p>
        </div>
      )}
    </div>
  );
}
