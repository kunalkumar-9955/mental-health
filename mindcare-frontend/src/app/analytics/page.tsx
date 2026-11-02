"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, LineChart, Line
} from "recharts";
import { TrendingUp, Brain, Heart, Zap, BarChart3 } from "lucide-react";
import { analyticsAPI, moodAPI } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";

const COLORS = ["#7C3AED", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444", "#EC4899"];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [emotionalScore, setEmotionalScore] = useState<any>(null);
  const [moodAnalytics, setMoodAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, scoreRes, moodRes] = await Promise.allSettled([
        analyticsAPI.getDashboard(),
        analyticsAPI.getEmotionalScore(),
        moodAPI.getAnalytics(30),
      ]);

      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data);
      if (scoreRes.status === "fulfilled") setEmotionalScore(scoreRes.value.data);
      if (moodRes.status === "fulfilled") setMoodAnalytics(moodRes.value.data.analytics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const moodData = analytics?.moodData?.slice(-30) || [];
  const weeklyData = analytics?.weeklyAverages || [];

  const radarData = [
    { subject: "Mood", value: (analytics?.avgMood || 5) * 10 },
    { subject: "Sleep", value: (moodAnalytics?.avgSleep || 7) * 10 },
    { subject: "Energy", value: 60 },
    { subject: "Social", value: 55 },
    { subject: "Focus", value: 65 },
    { subject: "Calm", value: 70 },
  ];

  const emotionData: { name: string; value: number }[] = emotionalScore?.breakdown
    ? Object.entries(emotionalScore.breakdown).map(([name, value]) => ({ name, value: value as number }))
    : [];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-white/60 text-sm mt-1">Deep insights into your emotional wellness journey</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Wellness Score", value: `${analytics?.overview?.wellnessScore || 65}%`, icon: Heart, color: "from-purple-600 to-purple-400" },
            { label: "Emotional Score", value: emotionalScore?.score || 70, icon: Brain, color: "from-cyan-600 to-cyan-400" },
            { label: "Avg Mood", value: `${analytics?.avgMood || 5}/10`, icon: Zap, color: "from-green-600 to-green-400" },
            { label: "Sessions", value: analytics?.overview?.totalSessions || 0, icon: BarChart3, color: "from-pink-600 to-pink-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 rounded-2xl"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-white/60 text-xs mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 30-day Mood Trend */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4">30-Day Mood Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="moodA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "rgba(15,10,30,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                <Area type="monotone" dataKey="mood" stroke="#7C3AED" fill="url(#moodA)" strokeWidth={2} name="Mood" />
                <Area type="monotone" dataKey="stress" stroke="#EF4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Stress" />
                <Area type="monotone" dataKey="sleep" stroke="#06B6D4" fill="none" strokeWidth={1.5} strokeDasharray="2 4" name="Sleep" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Wellness Radar */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4">Wellness Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <Radar name="Wellness" dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Progress */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4">Weekly Mood Averages</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "rgba(15,10,30,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                <Bar dataKey="avgMood" radius={[6, 6, 0, 0]} name="Avg Mood">
                  {weeklyData.map((_entry: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Emotion Distribution */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4">Emotion Distribution</h3>
            {emotionData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={emotionData} cx={75} cy={75} outerRadius={70} dataKey="value">
                      {emotionData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(15,10,30,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {emotionData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-white/70 text-xs capitalize flex-1">{item.name}</span>
                      <span className="text-white/50 text-xs">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <p className="text-white/40 text-sm">Start chatting to see emotion data</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-white font-semibold mb-4">AI Insights</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: "📈",
                title: "Mood Trend",
                insight: analytics?.overview?.trend === "improving"
                  ? "Your mood has been improving! Keep up the great work with your wellness practices."
                  : analytics?.overview?.trend === "declining"
                  ? "Your mood has been lower recently. Consider scheduling more self-care activities."
                  : "Your mood has been stable. Consistency is key to long-term wellness.",
              },
              {
                icon: "💤",
                title: "Sleep Impact",
                insight: `Average sleep of ${moodAnalytics?.avgSleep?.toFixed(1) || 7} hours. ${
                  (moodAnalytics?.avgSleep || 7) >= 7
                    ? "Good sleep duration! Quality sleep is crucial for emotional regulation."
                    : "Consider improving your sleep schedule. Poor sleep significantly impacts mood."
                }`,
              },
              {
                icon: "🧘",
                title: "Wellness Score",
                insight: `Your wellness score is ${analytics?.overview?.wellnessScore || 65}%. ${
                  (analytics?.overview?.wellnessScore || 65) >= 70
                    ? "You're doing well! Continue your current wellness practices."
                    : "There's room for improvement. Try daily mood logging and breathing exercises."
                }`,
              },
            ].map((insight) => (
              <div key={insight.title} className="glass p-4 rounded-xl">
                <div className="text-2xl mb-2">{insight.icon}</div>
                <h4 className="text-white font-medium text-sm mb-2">{insight.title}</h4>
                <p className="text-white/60 text-xs leading-relaxed">{insight.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
