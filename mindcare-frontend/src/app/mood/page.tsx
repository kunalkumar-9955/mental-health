"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Plus, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { moodAPI } from "@/lib/api";
import { getMoodColor, getMoodEmoji, formatDate } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import MoodLogModal from "@/components/dashboard/MoodLogModal";
import toast from "react-hot-toast";

export default function MoodPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadData();
  }, [days]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, analyticsRes] = await Promise.all([
        moodAPI.getHistory(days),
        moodAPI.getAnalytics(days),
      ]);
      setLogs(logsRes.data.logs || []);
      setAnalytics(analyticsRes.data.analytics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const chartData = logs.slice().reverse().map(l => ({
    date: new Date(l.date).toLocaleDateString("en", { month: "short", day: "numeric" }),
    mood: l.mood,
    stress: l.stressLevel || 0,
    sleep: l.sleepHours || 0,
    anxiety: l.anxietyLevel || 0,
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mood Tracker</h1>
            <p className="text-white/60 text-sm mt-1">Track and understand your emotional patterns</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="mindcare-input px-3 py-2 rounded-xl text-sm"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
            </select>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Mood
            </button>
          </div>
        </div>

        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Avg Mood", value: `${analytics.avgMood}/10`, emoji: getMoodEmoji(analytics.avgMood) },
              { label: "Avg Stress", value: `${analytics.avgStress}/10`, emoji: "😤" },
              { label: "Avg Sleep", value: `${analytics.avgSleep}h`, emoji: "😴" },
              { label: "Trend", value: analytics.trend, emoji: analytics.trend === "improving" ? "📈" : analytics.trend === "declining" ? "📉" : "➡️" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-4 rounded-2xl">
                <p className="text-2xl mb-1">{stat.emoji}</p>
                <p className="text-white font-bold text-lg">{stat.value}</p>
                <p className="text-white/50 text-xs capitalize">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mood Chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">Mood Over Time</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "rgba(15,10,30,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                <Area type="monotone" dataKey="mood" stroke="#7C3AED" fill="url(#moodFill)" strokeWidth={2} name="Mood" />
                <Area type="monotone" dataKey="stress" stroke="#EF4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Stress" />
                <Area type="monotone" dataKey="sleep" stroke="#06B6D4" fill="none" strokeWidth={1.5} strokeDasharray="2 4" name="Sleep" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <p className="text-white/40 text-sm">No mood data for this period</p>
                <button onClick={() => setShowModal(true)} className="text-purple-400 text-xs mt-2 hover:underline">
                  Log your first mood →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent Logs */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">Recent Logs</h3>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 10).map((log) => (
                <div key={log._id} className="flex items-center gap-4 p-3 glass rounded-xl">
                  <div className="text-2xl">{getMoodEmoji(log.mood)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{log.mood}/10</span>
                      <div className="h-2 w-24 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${log.mood * 10}%`, background: getMoodColor(log.mood) }}
                        />
                      </div>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5">{formatDate(log.date)}</p>
                    {log.note && <p className="text-white/60 text-xs mt-1 truncate">{log.note}</p>}
                  </div>
                  {log.stressLevel && (
                    <div className="text-right">
                      <p className="text-white/50 text-xs">Stress</p>
                      <p className="text-white text-sm font-medium">{log.stressLevel}/10</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">No mood logs yet. Start tracking your emotions!</p>
          )}
        </div>
      </div>

      <MoodLogModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => { setShowModal(false); loadData(); toast.success("Mood logged! 💙"); }}
      />
    </AppLayout>
  );
}
