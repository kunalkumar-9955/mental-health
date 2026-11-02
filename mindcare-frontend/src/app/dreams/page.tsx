"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Plus, Trash2, Brain, AlertTriangle, X, Sparkles } from "lucide-react";
import { dreamsAPI } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import toast from "react-hot-toast";

const DREAM_TYPES = [
  { id: "dream", label: "Dream", emoji: "💭", color: "from-blue-600 to-cyan-500" },
  { id: "nightmare", label: "Nightmare", emoji: "😰", color: "from-red-600 to-orange-500" },
  { id: "recurring", label: "Recurring", emoji: "🔄", color: "from-purple-600 to-violet-500" },
  { id: "lucid", label: "Lucid Dream", emoji: "✨", color: "from-teal-600 to-emerald-500" },
];

const RISK_COLORS = { low: "text-green-400", medium: "text-yellow-400", high: "text-red-400" };

export default function DreamsPage() {
  const [dreams, setDreams] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "dream", moodBefore: 5 });

  useEffect(() => { loadDreams(); }, []);

  const loadDreams = async () => {
    setLoading(true);
    try {
      const res = await dreamsAPI.getAll();
      setDreams(res.data.dreams || []);
    } catch (e) {} finally { setLoading(false); }
  };

  const analyzeDream = async () => {
    if (!form.description.trim()) { toast.error("Describe your dream first"); return; }
    setAnalyzing(true);
    try {
      const res = await dreamsAPI.analyze(form);
      setDreams(prev => [res.data.dream, ...prev]);
      setSelected(res.data.dream);
      setShowNew(false);
      setForm({ title: "", description: "", type: "dream", moodBefore: 5 });
      toast.success("Dream analyzed! 🌙");
    } catch (e) {
      toast.error("Analysis failed");
    } finally { setAnalyzing(false); }
  };

  const deleteDream = async (id: string) => {
    try {
      await dreamsAPI.delete(id);
      setDreams(prev => prev.filter(d => d._id !== id));
      if (selected?._id === id) setSelected(null);
      toast.success("Dream deleted");
    } catch (e) { toast.error("Failed to delete"); }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dream & Nightmare Analyzer</h1>
            <p className="text-white/60 text-sm mt-1">AI-powered subconscious emotion analysis</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Analyze Dream
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Dream List */}
          <div className="space-y-3">
            <h3 className="text-white/60 text-sm font-medium">Dream Journal ({dreams.length})</h3>
            {loading ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-xl" />)
            ) : dreams.length > 0 ? dreams.map(dream => (
              <motion.div key={dream._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSelected(dream)}
                className={`p-4 rounded-xl cursor-pointer group transition-all ${selected?._id === dream._id ? "glass-card border border-purple-500/30" : "glass hover:bg-white/5"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{DREAM_TYPES.find(t => t.id === dream.type)?.emoji || "💭"}</span>
                      <p className="text-white text-sm font-medium truncate">{dream.title}</p>
                    </div>
                    <p className="text-white/50 text-xs truncate">{dream.description}</p>
                    <p className="text-white/30 text-xs mt-1">{formatDate(dream.date)}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteDream(dream._id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-all">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                {dream.aiAnalysis?.riskLevel && dream.aiAnalysis.riskLevel !== "low" && (
                  <div className={`text-xs mt-1 ${RISK_COLORS[dream.aiAnalysis.riskLevel as keyof typeof RISK_COLORS]}`}>
                    ⚠️ {dream.aiAnalysis.riskLevel} stress indicators
                  </div>
                )}
              </motion.div>
            )) : (
              <div className="text-center py-12">
                <Moon className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No dreams recorded yet</p>
              </div>
            )}
          </div>

          {/* Detail / New Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {showNew ? (
                <motion.div key="new" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">Record Your Dream</h3>
                    <button onClick={() => setShowNew(false)} className="text-white/60 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Dream title (optional)" value={form.title}
                      onChange={e => setForm({ ...form, title: e.target.value })}
                      className="mindcare-input w-full px-4 py-3 rounded-xl text-sm" />

                    <div className="grid grid-cols-4 gap-2">
                      {DREAM_TYPES.map(t => (
                        <button key={t.id} onClick={() => setForm({ ...form, type: t.id })}
                          className={`p-3 rounded-xl text-center transition-all ${form.type === t.id ? "bg-purple-600/30 border border-purple-500/50" : "glass hover:bg-white/10"}`}>
                          <div className="text-xl">{t.emoji}</div>
                          <div className="text-white/70 text-xs mt-1">{t.label}</div>
                        </button>
                      ))}
                    </div>

                    <textarea placeholder="Describe your dream in detail... What happened? Who was there? How did you feel?"
                      value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      rows={6} className="mindcare-input w-full px-4 py-3 rounded-xl text-sm resize-none" />

                    <div>
                      <label className="text-white/60 text-sm mb-2 block">Mood before sleep: {form.moodBefore}/10</label>
                      <input type="range" min={1} max={10} value={form.moodBefore}
                        onChange={e => setForm({ ...form, moodBefore: parseInt(e.target.value) })}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ background: "rgba(255,255,255,0.1)" }} />
                    </div>

                    <button onClick={analyzeDream} disabled={analyzing}
                      className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2">
                      {analyzing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Brain className="w-4 h-4" /> Analyze with AI</>}
                    </button>
                  </div>
                </motion.div>
              ) : selected ? (
                <motion.div key={selected._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} className="glass-card p-6 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{DREAM_TYPES.find(t => t.id === selected.type)?.emoji}</span>
                        <h3 className="text-white font-semibold text-lg">{selected.title}</h3>
                      </div>
                      <p className="text-white/50 text-sm">{formatDate(selected.date)}</p>
                    </div>
                    <button onClick={() => deleteDream(selected._id)} className="text-white/40 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-white/80 text-sm leading-relaxed mb-6 p-4 glass rounded-xl">{selected.description}</p>

                  {selected.aiAnalysis && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">AI Dream Analysis</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${selected.aiAnalysis.riskLevel === "high" ? "bg-red-500/20 text-red-400" : selected.aiAnalysis.riskLevel === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}>
                          {selected.aiAnalysis.riskLevel} risk
                        </span>
                      </div>

                      <div className="glass p-4 rounded-xl">
                        <p className="text-purple-400 text-xs font-medium mb-1">Interpretation</p>
                        <p className="text-white/80 text-sm leading-relaxed">{selected.aiAnalysis.interpretation}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {selected.aiAnalysis.subconsciousThemes?.length > 0 && (
                          <div className="glass p-3 rounded-xl">
                            <p className="text-cyan-400 text-xs font-medium mb-2">Subconscious Themes</p>
                            <div className="flex flex-wrap gap-1">
                              {selected.aiAnalysis.subconsciousThemes.map((t: string) => (
                                <span key={t} className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selected.aiAnalysis.stressIndicators?.length > 0 && (
                          <div className="glass p-3 rounded-xl">
                            <p className="text-yellow-400 text-xs font-medium mb-2">Stress Indicators</p>
                            <div className="flex flex-wrap gap-1">
                              {selected.aiAnalysis.stressIndicators.map((s: string) => (
                                <span key={s} className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 text-xs">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Moon className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">Dream Journal</h3>
                  <p className="text-white/50 text-sm mb-6 max-w-sm">Record your dreams and let AI reveal the emotional patterns hidden in your subconscious mind.</p>
                  <button onClick={() => setShowNew(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Record First Dream
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
