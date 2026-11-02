"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Mic, MicOff, Plus, Trash2, Download, 
  Settings, ChevronLeft, Brain, Smile, AlertTriangle,
  Volume2, BookOpen, BarChart3, Home
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { chatAPI, emotionAPI } from "@/lib/api";
import { formatTime, THERAPY_MODES, getEmotionEmoji } from "@/lib/utils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AIAvatar from "@/components/ui/AIAvatar";
import EmotionMeter from "@/components/chat/EmotionMeter";
import CrisisModal from "@/components/chat/CrisisModal";
import ParticleBackground from "@/components/ui/ParticleBackground";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  emotion?: any;
  isCrisis?: boolean;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, messages, addMessage, setMessages, currentSessionId, 
          setCurrentSessionId, therapyMode, setTherapyMode, isTyping, setIsTyping,
          isCrisisMode, setIsCrisisMode } = useStore();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [showEmotionPanel, setShowEmotionPanel] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [avatarMood, setAvatarMood] = useState<"calm" | "happy" | "concerned" | "supportive">("calm");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    loadSessions();
    // Welcome message
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: "welcome",
        role: "assistant",
        content: `Hello${user?.displayName ? `, ${user.displayName}` : ""}! 💙 I'm MindCare AI, your compassionate mental health companion. I'm here to listen, support, and help you navigate your emotions.\n\nHow are you feeling today? You can share anything — I'm a safe, judgment-free space.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, []);

  const loadSessions = async () => {
    try {
      const res = await chatAPI.getSessions();
      setSessions(res.data.sessions || []);
    } catch (e) {}
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const res = await chatAPI.sendMessage({
        message: input.trim(),
        sessionId: currentSessionId || undefined,
        therapyMode,
      });

      const { sessionId, message, emotion, isCrisis, crisisSeverity } = res.data;

      if (sessionId && !currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      // Update emotion display
      if (emotion) {
        setCurrentEmotion(emotion);
        setShowEmotionPanel(true);
        
        // Update avatar mood
        if (emotion.detected === "happiness") setAvatarMood("happy");
        else if (isCrisis) setAvatarMood("concerned");
        else setAvatarMood("supportive");
      }

      // Handle crisis
      if (isCrisis) {
        setIsCrisisMode(true);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: message,
        timestamp: new Date(),
        emotion,
        isCrisis,
      };

      addMessage(aiMessage);
      loadSessions();
    } catch (error: any) {
      toast.error("Failed to send message. Please try again.");
      // Add fallback message
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please check your internet connection and try again. I'm here for you. 💙",
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setIsCrisisMode(false);
    setCurrentEmotion(null);
    const welcomeMsg: Message = {
      id: "welcome-new",
      role: "assistant",
      content: "Starting a fresh conversation. I'm here to listen. What's on your mind? 💙",
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await chatAPI.deleteSession(sessionId);
      setSessions(sessions.filter(s => s._id !== sessionId));
      if (currentSessionId === sessionId) startNewChat();
      toast.success("Session deleted");
    } catch (e) {
      toast.error("Failed to delete session");
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const res = await chatAPI.getSession(sessionId);
      const session = res.data.session;
      const msgs: Message[] = session.messages.map((m: any) => ({
        id: m._id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
        emotion: m.emotion,
        isCrisis: m.isCrisis,
      }));
      setMessages(msgs);
      setCurrentSessionId(sessionId);
      setShowSidebar(false);
    } catch (e) {
      toast.error("Failed to load session");
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          // For demo, just set a placeholder
          setInput("(Voice message recorded - transcription would appear here)");
          stream.getTracks().forEach(t => t.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.success("Recording started...");
      } catch (e) {
        toast.error("Microphone access denied");
      }
    }
  };

  const currentMode = THERAPY_MODES.find(m => m.id === therapyMode);

  return (
    <div className="h-screen flex overflow-hidden relative">
      <ParticleBackground />

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed inset-y-0 left-0 z-40 w-72 glass border-r border-white/10 flex flex-col"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold">Chat History</span>
                <button onClick={() => setShowSidebar(false)} className="text-white/60 hover:text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={startNewChat}
                className="btn-primary w-full py-2 rounded-xl text-white text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Session
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className={`p-3 rounded-xl cursor-pointer group transition-all ${
                    currentSessionId === session._id
                      ? "bg-purple-600/20 border border-purple-500/30"
                      : "hover:bg-white/5"
                  }`}
                  onClick={() => loadSession(session._id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{session.sessionTitle}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {new Date(session.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(session._id); }}
                      className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {session.crisisDetected && (
                    <span className="text-red-400 text-xs">⚠️ Crisis detected</span>
                  )}
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-white/40 text-xs text-center py-8">No previous sessions</p>
              )}
            </div>

            {/* Navigation */}
            <div className="p-3 border-t border-white/10 space-y-1">
              {[
                { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
                { href: "/journal", icon: BookOpen, label: "Journal" },
                { href: "/", icon: Home, label: "Home" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm">
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <div className="glass border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className={`w-5 h-5 transition-transform ${showSidebar ? "rotate-180" : ""}`} />
          </button>

          <AIAvatar size="small" mood={avatarMood} isTyping={isTyping} />

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">MindCare AI</span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <p className="text-white/50 text-xs">
              {isTyping ? "Thinking..." : `${currentMode?.icon} ${currentMode?.name}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode selector */}
            <div className="relative">
              <button
                onClick={() => setShowModeSelector(!showModeSelector)}
                className="glass px-3 py-1.5 rounded-lg text-xs text-white/70 hover:text-white flex items-center gap-1"
              >
                <span>{currentMode?.icon}</span>
                <span className="hidden sm:block">{currentMode?.name}</span>
              </button>

              <AnimatePresence>
                {showModeSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 glass rounded-xl border border-white/10 overflow-hidden z-50"
                  >
                    {THERAPY_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => { setTherapyMode(mode.id); setShowModeSelector(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-white/10 transition-colors ${
                          therapyMode === mode.id ? "bg-purple-600/20 text-purple-300" : "text-white/70"
                        }`}
                      >
                        <span>{mode.icon}</span>
                        <span>{mode.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={startNewChat}
              className="glass p-2 rounded-lg text-white/60 hover:text-white transition-colors"
              title="New chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <AIAvatar size="small" mood={avatarMood} />
                  </div>
                )}

                <div className={`max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "chat-bubble-user text-white"
                        : msg.isCrisis
                        ? "crisis-overlay rounded-2xl text-white"
                        : "chat-bubble-ai text-white/90"
                    }`}
                  >
                    {msg.isCrisis && (
                      <div className="flex items-center gap-1 mb-2 text-red-400 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Crisis Support Mode</span>
                      </div>
                    )}
                    {msg.content}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-white/30 text-xs">{formatTime(msg.timestamp)}</span>
                    {msg.emotion && msg.role === "user" && (
                      <span className="text-xs text-white/40">
                        {getEmotionEmoji(msg.emotion.detected)} {msg.emotion.detected}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <AIAvatar size="small" mood={avatarMood} isTyping={true} />
              <div className="chat-bubble-ai px-4 py-3 rounded-2xl flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-400"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Emotion Panel */}
        <AnimatePresence>
          {showEmotionPanel && currentEmotion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/10 px-4 py-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-xs">Emotion Analysis</span>
                <button onClick={() => setShowEmotionPanel(false)} className="text-white/40 hover:text-white text-xs">
                  Hide
                </button>
              </div>
              <EmotionMeter
                emotion={currentEmotion.detected}
                score={currentEmotion.score}
                intensity={currentEmotion.intensity}
                breakdown={currentEmotion.breakdown}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="glass border-t border-white/10 p-4">
          <div className="flex items-end gap-3">
            <button
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-all flex-shrink-0 ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "glass text-white/60 hover:text-white"
              }`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind... (Press Enter to send)"
                rows={1}
                className="mindcare-input w-full px-4 py-3 rounded-xl text-sm resize-none max-h-32"
                style={{ minHeight: "48px" }}
              />
            </div>

            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="btn-primary p-3 rounded-xl text-white flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-white/30 text-xs mt-2 text-center">
            MindCare AI is not a substitute for professional medical advice. 
            In crisis? Call <a href="tel:9152987821" className="text-red-400">9152987821</a>
          </p>
        </div>
      </div>

      {/* Crisis Modal */}
      <CrisisModal
        isOpen={isCrisisMode}
        onClose={() => setIsCrisisMode(false)}
      />
    </div>
  );
}
