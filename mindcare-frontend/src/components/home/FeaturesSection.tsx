"use client";

import { motion } from "framer-motion";
import { Brain, Heart, Mic, BarChart3, Shield, Moon, Zap, MessageCircle, BookOpen } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Emotional Intelligence AI",
    description: "Advanced emotion detection that understands sadness, anxiety, stress, and more with nuanced empathy.",
    color: "from-purple-600 to-purple-400",
    glow: "rgba(124,58,237,0.3)"
  },
  {
    icon: Heart,
    title: "Crisis Detection & Support",
    description: "Real-time monitoring for crisis signals with immediate emergency resources and calming interventions.",
    color: "from-red-600 to-pink-400",
    glow: "rgba(239,68,68,0.3)"
  },
  {
    icon: Mic,
    title: "Voice Emotion Analysis",
    description: "Analyze stress and emotions from your voice using Whisper AI and advanced audio processing.",
    color: "from-cyan-600 to-blue-400",
    glow: "rgba(6,182,212,0.3)"
  },
  {
    icon: BarChart3,
    title: "Mood Analytics Dashboard",
    description: "Beautiful charts tracking your emotional journey, stress patterns, and wellness progress over time.",
    color: "from-green-600 to-emerald-400",
    glow: "rgba(34,197,94,0.3)"
  },
  {
    icon: Shield,
    title: "Complete Privacy",
    description: "End-to-end encryption, anonymous mode, and full data control. Your mental health data stays yours.",
    color: "from-blue-600 to-indigo-400",
    glow: "rgba(59,130,246,0.3)"
  },
  {
    icon: Moon,
    title: "Sleep & Wellness Tracking",
    description: "Monitor sleep quality, track wellness scores, and get personalized recommendations for better rest.",
    color: "from-indigo-600 to-purple-400",
    glow: "rgba(99,102,241,0.3)"
  },
  {
    icon: Zap,
    title: "9 Therapy Modes",
    description: "Specialized modes for student stress, anxiety, depression, relationships, sleep, panic attacks, and more.",
    color: "from-yellow-600 to-orange-400",
    glow: "rgba(234,179,8,0.3)"
  },
  {
    icon: MessageCircle,
    title: "AI Memory System",
    description: "Your AI therapist remembers your history, triggers, and preferences for truly personalized support.",
    color: "from-pink-600 to-rose-400",
    glow: "rgba(236,72,153,0.3)"
  },
  {
    icon: BookOpen,
    title: "Smart Mood Journal",
    description: "AI-powered journaling with emotional insights, mood tracking, and personalized reflections.",
    color: "from-teal-600 to-cyan-400",
    glow: "rgba(20,184,166,0.3)"
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-4 border border-purple-500/30">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-white/80">Powered by Advanced AI</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Everything You Need for{" "}
            <span className="gradient-text">Mental Wellness</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            A comprehensive AI mental health platform with features designed by 
            mental health professionals and powered by cutting-edge AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card p-6 rounded-2xl group cursor-pointer"
              style={{ boxShadow: `0 0 0 1px rgba(255,255,255,0.05)` }}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                style={{ boxShadow: `0 0 20px ${feature.glow}` }}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
