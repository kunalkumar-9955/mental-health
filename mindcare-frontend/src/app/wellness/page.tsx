"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Brain, AlertTriangle, TrendingUp, RefreshCw, Shield, Zap, Heart, Moon } from "lucide-react";
import { wellnessAPI } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import toast from "react-hot-toast";

const RISK_COLORS = { low: "#22C55E", moderate: "#F59E0B", high: "#F97316", critical: "#EF4444" };
const RISK_BG = { low: "from-green-600/20 to-green-500/10", moderate: "from-yellow-600/20 to-yellow-500/10", high: "from-orange-600/20 to-orange-500/10", critical: "from-red-600/20 to-red-500/10" };

export default function WellnessPage() {
  const [score, setScore] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [latestRes, historyRes, reportRes] = await Promise.allSettled([
        wellnessAPI.getLatest(),
        wellnessAPI.getHistory(),
        wellnessAPI.getReport()
      ]);
      if (latestRes.status === "fulfilled") setScore(latestRes.value.data.score);
      if (historyRes.status === "fulfilled") setHistory(historyRes.value.data.scores || []);
      if (reportRes.status === "fulfilled") setReport(reportRes.value.data.report || "");
    } catch (e) {} finally { setLoading(false); }
  };

  const recalculate = async () => {
    setCalculating(true);
    try {
      const res = await wellnessAPI.calculate();
      setScore(res.data.score);
      toast.success("Wellness score updated!");
      loadData();
    } catch (e) {
      toast.error("Failed to calculate score");
    } finally { setCalculating(false); }
  };

  const radarData = score ? [
    { subject: "Stability", value: score.scores.emotionalStability },
    { subject: "Recovery", value: score.scores.recoveryScore },
    { subject: "Sleep", value: score.lifeBalance?.sleep || 60 },
    { subject: "Social", value: score.lifeBalance?.social || 50 },
    { subject: "Focus", value: score.lifeBalance?.work || 55 },
    { subject: "Energy", value: score.lifeBalance?.exercise || 40 },
  ] : [];

  const historyChartData = history.slice().reverse().map((s, i) => ({
    day: `Day ${i + 1}`,
    wellness: s.scores.overallWellness,
    stress: s.scores.stress,
    anxiety: s.scores.anxiety
  }));

  const riskLevel = score?.riskLevel || "low";

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Mental Health Risk Score</h1>
            <p className="text-white/60 text-sm mt-1">Real-time wellness analysis & predictions</p>
          </div>
          <button onClick={recalculate} disabled={calculating}
            className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${calculating ? "animate-spin" : ""}`} />
            Recalculate
          </button>
        </div>

        {/* Main Wellness Meter */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className={`glass-card p-8 rounded-3xl bg-gradient-to-br ${RISK_BG[riskLevel as keyof typeof RISK_BG]}`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Circular Gauge */}
            <div className="relative flex items-center justify-center">
              <svg width="180" height="180" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                <motion.circle cx="90" cy="90" r="75" fill="none"
                  stroke={RISK_COLORS[riskLevel as keyof typeof RISK_COLORS]}
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 75}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 75 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 75 * (1 - (score?.scores.overallWellness || 65) / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                />
              </svg>
              <div className="absolute text-center">
                <div className="text-4xl font-black gradient-text">{score?.scores.overallWellness || 65}</div>
                <div className="text-white/50 text-xs">/ 100</div>
                <div className="text-xs font-medium mt-1 capitalize" style={{ color: RISK_COLORS[riskLevel as keyof typeof RISK_COLORS] }}>
                  {riskLevel} risk
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {score && [
                { label: "Stress Level", value: score.scores.stress, icon: Zap, color: "#EF4444" },
                { label: "Anxiety", value: score.scores.anxiety, icon: Brain, color: "#F59E0B" },
                { label: "Burnout Risk", value: score.scores.burnoutRisk, icon: AlertTriangle, color: "#F97316" },
                { label: "Emotional Stability", value: score.scores.emotionalStability, icon: Heart, color: "#22C55E" },
                { label: "Recovery Score", value: score.scores.recoveryScore, icon: TrendingUp, color: "#06B6D4" },
                { label: "Overall Wellness", value: score.scores.overallWellness, icon: Shield, color: "#7C3AED" },
              ].map(item => (
                <div key={item.label} className="glass p-3 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-3 h-3" style={{ color: item.color }} />
                    <span className="text-white/60 text-xs">{item.label}</span>
                  </div>
                  <div className="text-white font-bold text-lg">{item.value}</div>
                  <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ duration: 1 }}
                      style={{ background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Predictions + Radar */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Relapse Predictions */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              AI Relapse Predictions
            </h3>
            <div className="space-y-3">
              {score?.predictions && Object.entries(score.predictions).map(([key, val]) => {
                const labels: Record<string, string> = { burnoutRisk: "Burnout Risk", depressionRisk: "Depression Risk", anxietyRelapse: "Anxiety Relapse", stressOverload: "Stress Overload" };
                const v = val as number;
                const color = v > 70 ? "#EF4444" : v > 50 ? "#F59E0B" : "#22C55E";
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-white/70 text-sm">{labels[key] || key}</span>
                      <span className="text-sm font-medium" style={{ color }}>{v}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                        animate={{ width: `${v}%` }} transition={{ duration: 1 }}
                        style={{ background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Wellness Radar */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4">Life Balance Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <Radar dataKey="value" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History Chart */}
        {historyChartData.length > 1 && (
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-white font-semibold mb-4">Wellness History</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={historyChartData}>
                <defs>
                  <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "rgba(15,10,30,0.95)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "12px", color: "white" }} />
                <Area type="monotone" dataKey="wellness" stroke="#7C3AED" fill="url(#wg)" strokeWidth={2} name="Wellness" />
                <Area type="monotone" dataKey="stress" stroke="#EF4444" fill="none" strokeWidth={1.5} strokeDasharray="4 4" name="Stress" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Report + Recommendations */}
        {score && (
          <div className="grid md:grid-cols-2 gap-6">
            {report && (
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  AI Wellness Report
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">{report}</p>
              </div>
            )}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="text-white font-semibold mb-3">Recommendations</h3>
              <div className="space-y-2">
                {score.recommendations?.map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-purple-600/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-400 text-xs">{i + 1}</span>
                    </div>
                    <p className="text-white/70 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!score && !loading && (
          <div className="glass-card p-12 rounded-2xl text-center">
            <Brain className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">No Wellness Data Yet</h3>
            <p className="text-white/50 text-sm mb-6">Log your mood daily to get AI-powered wellness predictions and risk analysis.</p>
            <button onClick={recalculate} className="btn-primary px-6 py-3 rounded-xl text-white font-medium">
              Calculate My Wellness Score
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
