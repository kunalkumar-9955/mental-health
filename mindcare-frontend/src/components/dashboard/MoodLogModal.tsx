"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import { moodAPI } from "@/lib/api";
import { getMoodColor, getMoodEmoji } from "@/lib/utils";
import toast from "react-hot-toast";

interface MoodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMOTIONS = ["happy", "sad", "anxious", "stressed", "angry", "calm", "lonely", "grateful", "excited", "tired"];
const ACTIVITIES = ["exercise", "meditation", "journaling", "socializing", "work", "study", "rest", "nature", "music", "reading"];

export default function MoodLogModal({ isOpen, onClose, onSuccess }: MoodLogModalProps) {
  const [mood, setMood] = useState(5);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [sleepHours, setSleepHours] = useState(7);
  const [stressLevel, setStressLevel] = useState(5);
  const [loading, setLoading] = useState(false);

  const toggleItem = (item: string, list: string[], setList: (l: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await moodAPI.log({
        mood,
        emotions: selectedEmotions.map(e => ({ name: e, score: 50 })),
        note,
        activities: selectedActivities,
        sleepHours,
        stressLevel,
      });
      onSuccess();
    } catch (e) {
      toast.error("Failed to log mood");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">How are you feeling?</h2>
              <button onClick={onClose} className="text-white/60 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mood Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-white/70 text-sm">Overall Mood</label>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{getMoodEmoji(mood)}</span>
                  <span className="text-white font-bold text-xl">{mood}/10</span>
                </div>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${getMoodColor(mood)} 0%, ${getMoodColor(mood)} ${(mood - 1) * 11.1}%, rgba(255,255,255,0.1) ${(mood - 1) * 11.1}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
              <div className="flex justify-between text-white/30 text-xs mt-1">
                <span>😢 Very Low</span>
                <span>😄 Very High</span>
              </div>
            </div>

            {/* Emotions */}
            <div className="mb-5">
              <label className="text-white/70 text-sm mb-3 block">Emotions (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map((e) => (
                  <button
                    key={e}
                    onClick={() => toggleItem(e, selectedEmotions, setSelectedEmotions)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all capitalize ${
                      selectedEmotions.includes(e)
                        ? "bg-purple-600 text-white"
                        : "glass text-white/60 hover:text-white"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div className="mb-5">
              <label className="text-white/70 text-sm mb-3 block">Activities today</label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleItem(a, selectedActivities, setSelectedActivities)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all capitalize ${
                      selectedActivities.includes(a)
                        ? "bg-cyan-600 text-white"
                        : "glass text-white/60 hover:text-white"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep & Stress */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Sleep Hours: {sleepHours}h</label>
                <input
                  type="range" min={0} max={12} value={sleepHours}
                  onChange={(e) => setSleepHours(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Stress Level: {stressLevel}/10</label>
                <input
                  type="range" min={1} max={10} value={stressLevel}
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                />
              </div>
            </div>

            {/* Note */}
            <div className="mb-6">
              <label className="text-white/70 text-sm mb-2 block">Notes (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How was your day? Any thoughts to share..."
                rows={3}
                className="mindcare-input w-full px-4 py-3 rounded-xl text-sm resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Mood Log
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
