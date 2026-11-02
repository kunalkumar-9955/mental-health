"use client";

import { motion } from "framer-motion";
import { getEmotionColor, getEmotionEmoji } from "@/lib/utils";

interface EmotionMeterProps {
  emotion: string;
  score: number;
  intensity: string;
  breakdown?: Record<string, number>;
}

export default function EmotionMeter({ emotion, score, intensity, breakdown }: EmotionMeterProps) {
  const color = getEmotionColor(emotion);
  const emoji = getEmotionEmoji(emotion);

  return (
    <div className="glass p-4 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <div>
            <p className="text-white text-sm font-medium capitalize">{emotion}</p>
            <p className="text-white/50 text-xs capitalize">{intensity} intensity</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold text-lg">{score}%</p>
        </div>
      </div>

      {/* Main emotion bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
        />
      </div>

      {/* Breakdown */}
      {breakdown && (
        <div className="space-y-1.5">
          {Object.entries(breakdown)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-white/50 text-xs w-16 capitalize">{key}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full"
                    style={{ background: getEmotionColor(key) }}
                  />
                </div>
                <span className="text-white/40 text-xs w-8 text-right">{value}%</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
