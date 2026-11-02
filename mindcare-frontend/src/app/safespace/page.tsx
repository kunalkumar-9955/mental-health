"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, TreePine, Moon, Waves, Wind, Heart, Volume2, VolumeX } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

const ENVIRONMENTS = [
  {
    id: "rain", name: "Gentle Rain", icon: Cloud, emoji: "🌧️",
    bg: "from-slate-900 via-blue-950 to-slate-900",
    particles: "💧", particleCount: 40,
    affirmation: "You are safe. Let the rain wash away your worries.",
    color: "#60A5FA"
  },
  {
    id: "forest", name: "Forest Sanctuary", icon: TreePine, emoji: "🌲",
    bg: "from-green-950 via-emerald-900 to-green-950",
    particles: "🍃", particleCount: 25,
    affirmation: "You are grounded. Nature holds you gently.",
    color: "#34D399"
  },
  {
    id: "night", name: "Night Sky", icon: Moon, emoji: "🌙",
    bg: "from-indigo-950 via-purple-950 to-indigo-950",
    particles: "⭐", particleCount: 50,
    affirmation: "Under the stars, you are never alone.",
    color: "#A78BFA"
  },
  {
    id: "ocean", name: "Ocean Calm", icon: Waves, emoji: "🌊",
    bg: "from-cyan-950 via-blue-900 to-cyan-950",
    particles: "🫧", particleCount: 20,
    affirmation: "Like the ocean, you are vast and powerful.",
    color: "#22D3EE"
  },
  {
    id: "breeze", name: "Mountain Breeze", icon: Wind, emoji: "🏔️",
    bg: "from-sky-950 via-slate-900 to-sky-950",
    particles: "🌸", particleCount: 30,
    affirmation: "Breathe in peace. Breathe out tension.",
    color: "#7DD3FC"
  },
];

const AFFIRMATIONS = [
  "You are enough, exactly as you are.",
  "This moment will pass. You are stronger than you know.",
  "Your feelings are valid. You deserve care.",
  "You are not alone in this journey.",
  "Every breath is a new beginning.",
  "You have survived every difficult day so far.",
  "Be gentle with yourself today.",
  "You are worthy of love and peace.",
];

export default function SafeSpacePage() {
  const [activeEnv, setActiveEnv] = useState(ENVIRONMENTS[2]);
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0]);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [showJournal, setShowJournal] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathCount, setBreathCount] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setAffirmationIndex(i => (i + 1) % AFFIRMATIONS.length);
      setAffirmation(AFFIRMATIONS[(affirmationIndex + 1) % AFFIRMATIONS.length]);
    }, 8000);
    return () => clearInterval(interval);
  }, [affirmationIndex]);

  useEffect(() => {
    const phases: Array<{ phase: "inhale" | "hold" | "exhale"; duration: number }> = [
      { phase: "inhale", duration: 4000 },
      { phase: "hold", duration: 4000 },
      { phase: "exhale", duration: 4000 },
    ];
    let i = 0;
    const run = () => {
      setBreathPhase(phases[i].phase);
      setBreathCount(phases[i].duration / 1000);
      const countdown = setInterval(() => setBreathCount(c => c - 1), 1000);
      const next = setTimeout(() => {
        clearInterval(countdown);
        i = (i + 1) % phases.length;
        run();
      }, phases[i].duration);
      return () => { clearInterval(countdown); clearTimeout(next); };
    };
    const cleanup = run();
    return cleanup;
  }, []);

  const env = activeEnv;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${env.bg} relative overflow-hidden`}>
      {/* Floating particles */}
      {[...Array(env.particleCount)].map((_, i) => (
        <motion.div key={i} className="absolute text-lg pointer-events-none select-none"
          initial={{ x: `${Math.random() * 100}vw`, y: "110vh", opacity: 0 }}
          animate={{ y: "-10vh", opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration: 8 + Math.random() * 10, repeat: Infinity, delay: Math.random() * 10, ease: "linear" }}>
          {env.particles}
        </motion.div>
      ))}

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: env.color }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }} />
      </div>

      {/* Environment Selector */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 glass p-2 rounded-2xl">
        {ENVIRONMENTS.map(e => (
          <button key={e.id} onClick={() => setActiveEnv(e)}
            className={`p-2 rounded-xl transition-all text-lg ${activeEnv.id === e.id ? "bg-white/20" : "hover:bg-white/10"}`}
            title={e.name}>
            {e.emoji}
          </button>
        ))}
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-xl hover:bg-white/10 text-white/60">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 gap-8">
        {/* Environment Name */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center">
          <div className="text-5xl mb-2">{env.emoji}</div>
          <h1 className="text-white/80 text-xl font-light">{env.name}</h1>
        </motion.div>

        {/* Breathing Orb */}
        <div className="relative flex items-center justify-center">
          <motion.div className="absolute rounded-full blur-2xl"
            style={{ width: 200, height: 200, background: env.color, opacity: 0.2 }}
            animate={{ scale: breathPhase === "inhale" ? 1.3 : breathPhase === "hold" ? 1.3 : 1 }}
            transition={{ duration: 4, ease: "easeInOut" }} />
          <motion.div className="rounded-full flex flex-col items-center justify-center"
            style={{ width: 160, height: 160, background: `radial-gradient(circle, ${env.color}40, transparent)`, border: `2px solid ${env.color}40` }}
            animate={{ scale: breathPhase === "inhale" ? 1.2 : breathPhase === "hold" ? 1.2 : 1 }}
            transition={{ duration: 4, ease: "easeInOut" }}>
            <span className="text-white/80 text-sm font-medium capitalize">{breathPhase}</span>
            <span className="text-white text-3xl font-bold">{breathCount}</span>
          </motion.div>
        </div>

        {/* Affirmation */}
        <AnimatePresence mode="wait">
          <motion.div key={affirmation} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.8 }}
            className="text-center max-w-md">
            <p className="text-white/80 text-lg font-light italic leading-relaxed">"{affirmation}"</p>
          </motion.div>
        </AnimatePresence>

        {/* Journal Toggle */}
        <div className="flex gap-3">
          <button onClick={() => setShowJournal(!showJournal)}
            className="glass px-4 py-2 rounded-xl text-white/70 hover:text-white text-sm flex items-center gap-2 transition-all">
            <Heart className="w-4 h-4" />
            {showJournal ? "Close Journal" : "Private Journal"}
          </button>
        </div>

        {/* Private Journal */}
        <AnimatePresence>
          {showJournal && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="w-full max-w-md">
              <textarea value={journalText} onChange={e => setJournalText(e.target.value)}
                placeholder="This is your private space. Write anything you feel... it stays here with you."
                rows={5}
                className="w-full px-4 py-3 rounded-2xl text-sm resize-none text-white/80 placeholder-white/30 leading-relaxed"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${env.color}30`, backdropFilter: "blur(10px)" }} />
              <p className="text-white/30 text-xs text-center mt-2">Your words are private and not saved</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
