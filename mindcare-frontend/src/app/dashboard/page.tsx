"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, 
  Radar, PolarGrid, PolarAngleAxis 
} from "recharts";
import { 
  Brain, Heart, TrendingUp, TrendingDown, Minus,
  MessageCircle, BookOpen, Zap, Moon, BarChart3,
  Calendar, Award, Target, Plus, ArrowRight
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { analyticsAPI, moodAPI, therapyAPI, notificationAPI } from "@/lib/api";
import { getMoodColor, getMoodEmoji, formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import ParticleBackground from "@/components/ui/ParticleBackground";
import AppLayout from "@/components/layout/AppLayout";
import MoodLogModal from "@/components/dashboard/MoodLogModal";
import BreathingCircle from "@/components/ui/BreathingCircle";

const EMOTION_COLORS = {
  happiness: "#22C55E",
  sadness: "#3B82F6",
  anxiety: "#F59E0B",
  stress: "#EF4444",
  neutral: "#6B7280",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [emotionalScore, setEmotionalScore] = useState<any>(null);
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMoodLog, setShowMoodLog] = useState(false);
  const [todayMood, setTodayMood] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, scoreRes, quoteRes, todayRes] = await Promise.allSettled([
        analyticsAPI.getDashboard(),
        analyticsAPI.getEmotionalScore(),
        therapyAPI.getQuote(),
        moodAPI.getToday(),
      ]);

      if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value.data);
      if (scoreRes.status === "fulfilled") setEmotionalScore(scoreRes.value.data);
      if (quoteRes.status === "fulfilled") setQuote(quoteRes.value.data.quote);
      if (todayRes.status === "fulfilled") setTodayMood(todayRes.value.data.log);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const wellnessScore = analytics?.overview?.wellnessScore || 65;
  const trend = analytics?.overview?.trend || "stable";

  const TrendIcon = trend === "improving" ? TrendingUp : trend === "declining" ? TrendingDown : Minus;
  const trendColor = trend === "improving" ? "text-green-400" : trend === "declining" ? "text-red-400" : "text-yellow-400";

  const moodData = analytics?.moodData?.slice(-14) || [];
  const weeklyData = analytics?.weeklyAverages || [];

  const emotionPieData: { name: string; value: number }[] = emotionalScore?.breakdown
    ? Object.entries(emotionalScore.breakdown)
        .filter(([, v]) => (v as number) > 0)
        .map(([name, value]) => ({ name, value: value as number }))
    : [{ name: "neutral", value: 1 }];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60">Loading your wellness data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.displayName?.split(" ")[0] || "Friend"} 💙
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => setShowMoodLog(true)}
            className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Mood
          </button>
        </div>

        {/* Daily Quote */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 rounded-2xl border-l-4 border-purple-500"
          >
            <p className="text-white/80 italic text-sm leading-relaxed">"{quote.text}"</p>
            <p className="text-purple-400 text-xs mt-2">— {quote.author}</p>
          </motion.div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Wellness Score",
              value: `${wellnessScore}%`,
              icon: Heart,
              color: "from-purple-600 to-purple-400",
              sub: trend,
              subColor: trendColor,
              SubIcon: TrendIcon,
            },
            {
              label: "Chat Sessions",
              value: analytics?.overview?.totalSessions || 0,
              icon: MessageCircle,
              color: "from-cyan-600 to-cyan-400",
              sub: "Total sessions",
              subColor: "text-white/50",
            },
            {
              label: "Mood Logs",
              value: analytics?.overview?.moodLogs || 0,
              icon: BarChart3,
              color: "from-green-600 to-green-400",
              sub: "Last 30 days",
              subColor: "text-white/50",
            },
            {
              label: "Avg Mood",
              value: `${analytics?.avgMood || 5}/10`,
              icon: Zap,
              color: "from-yellow-600 to-yellow-400",
              sub: getMoodEmoji(analytics?.avgMood || 5),
              subColor: "text-white/50",
            },
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
              <div className={`flex items-center gap-1 mt-1 ${stat.subColor}`}>
                {stat.SubIcon && <stat.SubIcon className="w-3 h-3" />}
                <span className="text-xs capitalize">{stat.sub}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Mood Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl"
          >
            <h3 className="text-white font-semibold mb-4">Mood Trend (14 days)</h3>
            {moodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={moodData}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: "rgba(15,10,30,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                  <Area type="monotone" dataKey="mood" stroke="#7C3AED" fill="url(#moodGrad)" strokeWidth={2} name="Mood" />
                  <Area type="monotone" dataKey="stress" stroke="#EF4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Stress" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/40 text-sm">No mood data yet</p>
                  <button onClick={() => setShowMoodLog(true)} className="text-purple-400 text-xs mt-2 hover:underline">
                    Log your first mood →
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Emotion Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 rounded-2xl"
          >
            <h3 className="text-white font-semibold mb-4">Emotional Score</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={emotionPieData}
                      cx={65}
                      cy={65}
                      innerRadius={45}
                      outerRadius={65}
                      dataKey="value"
                    >
                      {emotionPieData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={EMOTION_COLORS[entry.name as keyof typeof EMOTION_COLORS] || "#6B7280"}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold gradient-text">{emotionalScore?.score || 70}</p>
                    <p className="text-white/50 text-xs">Score</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {emotionPieData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: EMOTION_COLORS[item.name as keyof typeof EMOTION_COLORS] || "#6B7280" }} />
                    <span className="text-white/70 text-xs capitalize flex-1">{item.name}</span>
                    <span className="text-white/50 text-xs">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Weekly Progress + Breathing */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Weekly Averages */}
          <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4">Weekly Progress</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="week" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "rgba(15,10,30,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                <Bar dataKey="avgMood" fill="url(#barGrad)" radius={[6, 6, 0, 0]} name="Avg Mood">
                  {weeklyData.map((_entry: any, i: number) => (
                    <Cell key={`cell-${i}`} fill={`hsl(${260 + i * 20}, 70%, ${50 + i * 5}%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breathing Exercise */}
          <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
            <h3 className="text-white font-semibold mb-4 text-center">Quick Breathing</h3>
            <BreathingCircle size="medium" autoPlay={false} />
            <p className="text-white/50 text-xs mt-4 text-center">Tap to start a calming breathing exercise</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/chat", icon: MessageCircle, label: "Start Session", color: "from-purple-600 to-purple-400", desc: "Talk to AI therapist" },
            { href: "/journal", icon: BookOpen, label: "Write Journal", color: "from-cyan-600 to-cyan-400", desc: "Express your thoughts" },
            { href: "/mood", icon: BarChart3, label: "Mood Tracker", color: "from-green-600 to-green-400", desc: "Track your emotions" },
            { href: "/therapy", icon: Brain, label: "Therapy Modes", color: "from-pink-600 to-pink-400", desc: "Specialized support" },
          ].map((action, i) => (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Link href={action.href}
                className="glass-card p-4 rounded-2xl flex flex-col gap-3 hover:scale-105 transition-transform group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{action.label}</p>
                  <p className="text-white/50 text-xs">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Today's Check-in */}
        {!todayMood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 rounded-2xl border border-purple-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Daily Check-in</h3>
                <p className="text-white/60 text-sm mt-1">How are you feeling today? Log your mood to track your wellness journey.</p>
              </div>
              <button
                onClick={() => setShowMoodLog(true)}
                className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Check In
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mood Log Modal */}
      <MoodLogModal
        isOpen={showMoodLog}
        onClose={() => setShowMoodLog(false)}
        onSuccess={() => { setShowMoodLog(false); loadData(); toast.success("Mood logged! 💙"); }}
      />
    </AppLayout>
  );
}
