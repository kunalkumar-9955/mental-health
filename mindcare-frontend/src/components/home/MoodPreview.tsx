"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

const mockData = [
  { day: "Mon", mood: 4, stress: 7 },
  { day: "Tue", mood: 5, stress: 6 },
  { day: "Wed", mood: 3, stress: 8 },
  { day: "Thu", mood: 6, stress: 5 },
  { day: "Fri", mood: 7, stress: 4 },
  { day: "Sat", mood: 8, stress: 3 },
  { day: "Sun", mood: 7, stress: 4 },
];

const emotions = [
  { name: "Calm", value: 65, color: "#7C3AED" },
  { name: "Anxious", value: 20, color: "#F59E0B" },
  { name: "Sad", value: 10, color: "#3B82F6" },
  { name: "Happy", value: 5, color: "#22C55E" },
];

export default function MoodPreview() {
  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Track Your <span className="gradient-text">Emotional Journey</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Beautiful analytics that help you understand your emotional patterns 
            and celebrate your progress.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mood Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-semibold text-lg">Weekly Mood Trend</h3>
                <p className="text-white/50 text-sm">Your emotional journey this week</p>
              </div>
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>+23% better</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }} domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(15,10,30,0.95)",
                    border: "1px solid rgba(124,58,237,0.3)",
                    borderRadius: "12px",
                    color: "white",
                  }}
                />
                <Area type="monotone" dataKey="mood" stroke="#7C3AED" fill="url(#moodGradient)" strokeWidth={2} name="Mood" />
                <Area type="monotone" dataKey="stress" stroke="#EF4444" fill="url(#stressGradient)" strokeWidth={2} name="Stress" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-white/60 text-xs">Mood</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-white/60 text-xs">Stress</span>
              </div>
            </div>
          </motion.div>

          {/* Emotion Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 rounded-2xl"
          >
            <h3 className="text-white font-semibold text-lg mb-2">Emotion Breakdown</h3>
            <p className="text-white/50 text-sm mb-6">Your emotional state distribution</p>

            <div className="space-y-4">
              {emotions.map((emotion, i) => (
                <motion.div
                  key={emotion.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 text-sm">{emotion.name}</span>
                    <span className="text-white/60 text-sm">{emotion.value}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${emotion.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: emotion.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Wellness Score */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-500/10 border border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Wellness Score</p>
                  <p className="text-3xl font-bold gradient-text">78/100</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm font-medium">↑ Improving</p>
                  <p className="text-white/40 text-xs">vs last week</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
