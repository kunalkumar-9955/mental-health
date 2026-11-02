"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Wind, Clock } from "lucide-react";
import { THERAPY_MODES } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import AppLayout from "@/components/layout/AppLayout";
import BreathingCircle from "@/components/ui/BreathingCircle";

const modeColors: Record<string, string> = {
  general: "from-purple-600 to-purple-400",
  student_stress: "from-blue-600 to-blue-400",
  anxiety_relief: "from-cyan-600 to-cyan-400",
  depression_support: "from-green-600 to-green-400",
  relationship: "from-pink-600 to-pink-400",
  motivation: "from-yellow-600 to-yellow-400",
  sleep_therapy: "from-indigo-600 to-indigo-400",
  panic_attack: "from-red-600 to-red-400",
  meditation: "from-teal-600 to-teal-400",
};

const modeDescriptions: Record<string, string> = {
  general: "Open, supportive conversation with your AI therapist. Share anything on your mind.",
  student_stress: "Specialized support for academic pressure, exam anxiety, and study-life balance.",
  anxiety_relief: "Calm anxiety with proven techniques: breathing, grounding, and cognitive reframing.",
  depression_support: "Gentle, compassionate support for low mood with behavioral activation strategies.",
  relationship: "Navigate relationship challenges, communication issues, and heartbreak.",
  motivation: "Reignite your drive with personalized encouragement and goal-setting strategies.",
  sleep_therapy: "Improve sleep quality with sleep hygiene tips and relaxation techniques.",
  panic_attack: "Immediate support during panic attacks with grounding and breathing exercises.",
  meditation: "Guided mindfulness, meditation sessions, and present-moment awareness.",
};

const breathingExercises = [
  {
    id: "box",
    name: "Box Breathing",
    description: "Used by Navy SEALs for stress control",
    steps: ["Inhale 4s", "Hold 4s", "Exhale 4s", "Hold 4s"],
    color: "from-purple-600 to-purple-400"
  },
  {
    id: "478",
    name: "4-7-8 Breathing",
    description: "Natural tranquilizer for the nervous system",
    steps: ["Inhale 4s", "Hold 7s", "Exhale 8s"],
    color: "from-cyan-600 to-cyan-400"
  },
  {
    id: "calm",
    name: "Calm Breathing",
    description: "Simple relaxation breathing",
    steps: ["Inhale 5s", "Exhale 5s"],
    color: "from-green-600 to-green-400"
  },
];

export default function TherapyPage() {
  const router = useRouter();
  const { setTherapyMode } = useStore();
  const [selectedBreathing, setSelectedBreathing] = useState<string | null>(null);
  const [activeBreathing, setActiveBreathing] = useState(false);

  const startMode = (modeId: string) => {
    setTherapyMode(modeId);
    router.push("/chat");
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Therapy Modes</h1>
          <p className="text-white/60 text-sm mt-1">Choose a specialized therapy mode for personalized support</p>
        </div>

        {/* Therapy Modes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {THERAPY_MODES.map((mode, i) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="glass-card p-5 rounded-2xl cursor-pointer group"
              onClick={() => startMode(mode.id)}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${modeColors[mode.id]} flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform`}>
                {mode.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{mode.name}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-4">{modeDescriptions[mode.id]}</p>
              <div className="flex items-center gap-2 text-purple-400 text-sm group-hover:gap-3 transition-all">
                <span>Start Session</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Breathing Exercises */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Breathing Exercises</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {breathingExercises.map((ex) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-5 rounded-2xl"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ex.color} flex items-center justify-center mb-3`}>
                  <Wind className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1">{ex.name}</h3>
                <p className="text-white/60 text-xs mb-3">{ex.description}</p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {ex.steps.map((step) => (
                    <span key={step} className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-xs">{step}</span>
                  ))}
                </div>
                <button
                  onClick={() => setSelectedBreathing(selectedBreathing === ex.id ? null : ex.id)}
                  className={`w-full py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedBreathing === ex.id
                      ? "bg-purple-600 text-white"
                      : "btn-secondary text-white/70"
                  }`}
                >
                  {selectedBreathing === ex.id ? "Stop" : "Start Exercise"}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Active Breathing Circle */}
          {selectedBreathing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 rounded-2xl flex flex-col items-center mt-4"
            >
              <h3 className="text-white font-semibold mb-6">
                {breathingExercises.find(e => e.id === selectedBreathing)?.name}
              </h3>
              <BreathingCircle size="large" autoPlay={true} onComplete={() => setSelectedBreathing(null)} />
              <p className="text-white/50 text-sm mt-6">Follow the circle — breathe with it</p>
            </motion.div>
          )}
        </div>

        {/* Grounding Exercise */}
        <div className="glass-card p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-4">5-4-3-2-1 Grounding Technique</h2>
          <p className="text-white/60 text-sm mb-6">Use this when feeling anxious or overwhelmed. Focus on your senses to ground yourself in the present moment.</p>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { num: 5, sense: "SEE", emoji: "👁️", desc: "Look around and name 5 things you can see" },
              { num: 4, sense: "TOUCH", emoji: "✋", desc: "Notice 4 things you can physically feel" },
              { num: 3, sense: "HEAR", emoji: "👂", desc: "Listen for 3 sounds around you" },
              { num: 2, sense: "SMELL", emoji: "👃", desc: "Find 2 things you can smell" },
              { num: 1, sense: "TASTE", emoji: "👅", desc: "Notice 1 thing you can taste" },
            ].map((item) => (
              <div key={item.num} className="glass p-4 rounded-xl text-center">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-2xl font-bold gradient-text mb-1">{item.num}</div>
                <div className="text-white font-medium text-sm mb-2">{item.sense}</div>
                <p className="text-white/50 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
