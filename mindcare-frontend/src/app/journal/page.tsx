"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, BookOpen, Brain, Calendar, X, Save } from "lucide-react";
import { journalAPI } from "@/lib/api";
import { formatDate, getMoodEmoji } from "@/lib/utils";
import AppLayout from "@/components/layout/AppLayout";
import toast from "react-hot-toast";

export default function JournalPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", mood: 5, tags: "" });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const res = await journalAPI.getAll();
      setEntries(res.data.entries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!form.content.trim()) {
      toast.error("Please write something first");
      return;
    }
    setSaving(true);
    try {
      await journalAPI.create({
        title: form.title || undefined,
        content: form.content,
        mood: form.mood,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
      });
      toast.success("Journal entry saved with AI insights! 💙");
      setShowNew(false);
      setForm({ title: "", content: "", mood: 5, tags: "" });
      loadEntries();
    } catch (e) {
      toast.error("Failed to save entry");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await journalAPI.delete(id);
      setEntries(entries.filter(e => e._id !== id));
      if (selectedEntry?._id === id) setSelectedEntry(null);
      toast.success("Entry deleted");
    } catch (e) {
      toast.error("Failed to delete entry");
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Mood Journal</h1>
            <p className="text-white/60 text-sm mt-1">Express yourself and get AI-powered insights</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="btn-primary px-4 py-2 rounded-xl text-white text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Entries List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-white/70 text-sm font-medium">Your Entries ({entries.length})</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-20 rounded-xl" />
                ))}
              </div>
            ) : entries.length > 0 ? (
              entries.map((entry) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-xl cursor-pointer group transition-all ${
                    selectedEntry?._id === entry._id
                      ? "glass-card border border-purple-500/30"
                      : "glass hover:bg-white/5"
                  }`}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{getMoodEmoji(entry.mood || 5)}</span>
                        <p className="text-white text-sm font-medium truncate">{entry.title}</p>
                      </div>
                      <p className="text-white/50 text-xs truncate">{entry.content}</p>
                      <p className="text-white/30 text-xs mt-1">{formatDate(entry.date)}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteEntry(entry._id); }}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40 text-sm">No journal entries yet</p>
                <button onClick={() => setShowNew(true)} className="text-purple-400 text-xs mt-2 hover:underline">
                  Write your first entry →
                </button>
              </div>
            )}
          </div>

          {/* Entry Detail / New Entry */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {showNew ? (
                <motion.div
                  key="new"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold">New Journal Entry</h3>
                    <button onClick={() => setShowNew(false)} className="text-white/60 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Title (optional)"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="mindcare-input w-full px-4 py-3 rounded-xl text-sm"
                    />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-white/70 text-sm">Mood: {getMoodEmoji(form.mood)} {form.mood}/10</label>
                      </div>
                      <input
                        type="range" min={1} max={10} value={form.mood}
                        onChange={(e) => setForm({ ...form, mood: parseInt(e.target.value) })}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.1)" }}
                      />
                    </div>

                    <textarea
                      placeholder="What's on your mind? How are you feeling? Write freely..."
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      rows={8}
                      className="mindcare-input w-full px-4 py-3 rounded-xl text-sm resize-none"
                    />

                    <input
                      type="text"
                      placeholder="Tags (comma separated: anxiety, work, family)"
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      className="mindcare-input w-full px-4 py-3 rounded-xl text-sm"
                    />

                    <button
                      onClick={saveEntry}
                      disabled={saving}
                      className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          Save with AI Insights
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : selectedEntry ? (
                <motion.div
                  key={selectedEntry._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{getMoodEmoji(selectedEntry.mood || 5)}</span>
                        <h3 className="text-white font-semibold text-lg">{selectedEntry.title}</h3>
                      </div>
                      <p className="text-white/50 text-sm">{formatDate(selectedEntry.date)}</p>
                    </div>
                    <button
                      onClick={() => deleteEntry(selectedEntry._id)}
                      className="text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                  </div>

                  {selectedEntry.aiInsight && (
                    <div className="glass p-4 rounded-xl border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400 text-sm font-medium">AI Insight</span>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">{selectedEntry.aiInsight}</p>
                    </div>
                  )}

                  {selectedEntry.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedEntry.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 rounded-full bg-purple-600/20 text-purple-300 text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 rounded-2xl flex flex-col items-center justify-center text-center"
                >
                  <BookOpen className="w-16 h-16 text-white/20 mb-4" />
                  <h3 className="text-white font-semibold text-lg mb-2">Your Journal Awaits</h3>
                  <p className="text-white/50 text-sm mb-6 max-w-sm">
                    Writing about your feelings helps process emotions and gain clarity. 
                    Our AI will provide personalized insights for each entry.
                  </p>
                  <button
                    onClick={() => setShowNew(true)}
                    className="btn-primary px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Write First Entry
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
