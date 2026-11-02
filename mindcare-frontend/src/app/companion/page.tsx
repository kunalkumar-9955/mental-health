"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Heart, Sparkles, Settings, RefreshCw, Star } from "lucide-react";
import { companionAPI } from "@/lib/api";
import { useStore } from "@/store/useStore";
import AppLayout from "@/components/layout/AppLayout";
import toast from "react-hot-toast";

interface Message { id: string; role: "user" | "ai"; content: string; timestamp: Date; }

const PERSONALITY_COLORS: Record<string, string> = {
  soft_supportive: "from-pink-500 to-rose-400",
  motivational_coach: "from-yellow-500 to-orange-400",
  calm_listener: "from-blue-500 to-cyan-400",
  friendly_bestfriend: "from-purple-500 to-violet-400",
  meditation_guide: "from-teal-500 to-emerald-400",
  strict_mentor: "from-gray-600 to-slate-500",
};

const PERSONALITY_AURA: Record<string, string> = {
  soft_supportive: "rgba(244,114,182,0.3)",
  motivational_coach: "rgba(234,179,8,0.3)",
  calm_listener: "rgba(59,130,246,0.3)",
  friendly_bestfriend: "rgba(139,92,246,0.3)",
  meditation_guide: "rgba(20,184,166,0.3)",
  strict_mentor: "rgba(100,116,139,0.3)",
};

export default function CompanionPage() {
  const { user } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [companion, setCompanion] = useState<any>(null);
  const [personalities, setPersonalities] = useState<any[]>([]);
  const [showPersonalities, setShowPersonalities] = useState(false);
  const [emotionalBond, setEmotionalBond] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCompanion();
    loadPersonalities();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadCompanion = async () => {
    try {
      const res = await companionAPI.getProfile();
      setCompanion(res.data.companion);
      setEmotionalBond(res.data.companion.emotionalBond || 0);

      // Welcome message
      const name = user?.displayName?.split(" ")[0] || "friend";
      setMessages([{
        id: "welcome",
        role: "ai",
        content: `Hey ${name}! 💛 I'm ${res.data.companion.friendName || "Aria"}, your AI companion. I'm here whenever you need someone to talk to — no judgment, just genuine care. How are you feeling right now?`,
        timestamp: new Date()
      }]);
    } catch (e) {
      toast.error("Failed to load companion");
    }
  };

  const loadPersonalities = async () => {
    try {
      const res = await companionAPI.getPersonalities();
      setPersonalities(res.data.personalities);
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const sessionMessages = messages.slice(-6).map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));
      const res = await companionAPI.chat({ message: input.trim(), sessionMessages });
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "ai", content: res.data.reply, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      if (res.data.companion) {
        setEmotionalBond(res.data.companion.emotionalBond);
        setCompanion((prev: any) => ({ ...prev, ...res.data.companion }));
      }
    } catch (e) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const switchPersonality = async (personalityId: string) => {
    try {
      const res = await companionAPI.updatePersonality({ personality: personalityId });
      setCompanion(res.data.companion);
      setShowPersonalities(false);
      const p = personalities.find(p => p.id === personalityId);
      toast.success(`Switched to ${p?.name} mode ${p?.emoji}`);
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: "ai",
        content: `I've shifted into ${p?.name} mode ${p?.emoji}. ${p?.desc}. How can I support you?`,
        timestamp: new Date()
      }]);
    } catch (e) {
      toast.error("Failed to switch personality");
    }
  };

  const currentPersonality = companion?.personality || "friendly_bestfriend";
  const gradientClass = PERSONALITY_COLORS[currentPersonality] || PERSONALITY_COLORS.friendly_bestfriend;
  const auraColor = PERSONALITY_AURA[currentPersonality] || PERSONALITY_AURA.friendly_bestfriend;

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto">
        {/* Header */}
        <div className="glass-card p-4 rounded-2xl mb-4 flex items-center gap-4">
          {/* Companion Avatar */}
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className={`w-14 h-14 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-2xl`}
              style={{ boxShadow: `0 0 30px ${auraColor}` }}
            >
              💛
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-gray-900" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold">{companion?.friendName || "Aria"}</h2>
              <span className="text-xs text-white/40">Your AI Companion</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-400" />
                <span className="text-xs text-white/60">Bond: {emotionalBond}%</span>
              </div>
              <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${emotionalBond}%` }}
                  transition={{ duration: 1 }}
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPersonalities(!showPersonalities)}
              className="glass p-2 rounded-xl text-white/60 hover:text-white transition-colors"
              title="Change personality"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Personality Selector */}
        <AnimatePresence>
          {showPersonalities && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-4 rounded-2xl mb-4"
            >
              <p className="text-white/60 text-xs mb-3">Choose Aria's personality:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {personalities.map(p => (
                  <button
                    key={p.id}
                    onClick={() => switchPersonality(p.id)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      currentPersonality === p.id
                        ? "bg-purple-600/30 border border-purple-500/50"
                        : "glass hover:bg-white/10"
                    }`}
                  >
                    <div className="text-xl mb-1">{p.emoji}</div>
                    <div className="text-white text-xs font-medium">{p.name}</div>
                    <div className="text-white/40 text-xs">{p.desc}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          <AnimatePresence>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "ai" && (
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-sm flex-shrink-0`}
                    style={{ boxShadow: `0 0 15px ${auraColor}` }}
                  >
                    💛
                  </motion.div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-tr-sm"
                      : "glass text-white/90 rounded-tl-sm border border-white/10"
                  }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-sm`}>💛</div>
              <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-purple-400"
                    animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="glass-card p-3 rounded-2xl mt-4 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder={`Talk to ${companion?.friendName || "Aria"}...`}
            className="mindcare-input flex-1 px-4 py-2.5 rounded-xl text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className={`p-2.5 rounded-xl bg-gradient-to-br ${gradientClass} text-white disabled:opacity-50`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
