"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Brain, Shield, Heart, Mic, BarChart3, Moon, 
  Zap, MessageCircle, Star, ArrowRight, CheckCircle,
  Users, TrendingUp, Lock, Globe
} from "lucide-react";
import ParticleBackground from "@/components/ui/ParticleBackground";
import BreathingCircle from "@/components/ui/BreathingCircle";
import AIAvatar from "@/components/ui/AIAvatar";
import MoodPreview from "@/components/home/MoodPreview";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import StatsSection from "@/components/home/StatsSection";
import FeaturesSection from "@/components/home/FeaturesSection";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">MindCare AI</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:flex items-center gap-6"
            >
              {["Features", "How it Works", "Privacy", "About"].map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} 
                   className="text-white/70 hover:text-white transition-colors text-sm">
                  {item}
                </a>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <Link href="/auth" className="text-white/70 hover:text-white text-sm transition-colors">
                Sign In
              </Link>
              <Link href="/auth?mode=register" 
                className="btn-primary px-4 py-2 rounded-xl text-sm font-medium text-white">
                Get Started Free
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 bg-glow-gradient opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-6 border border-purple-500/30">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm text-white/80">AI Therapist Online 24/7</span>
                </div>

                <h1 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
                  <span className="text-white">Your AI</span>
                  <br />
                  <span className="gradient-text">Mental Health</span>
                  <br />
                  <span className="text-white">Companion</span>
                </h1>

                <p className="text-xl text-white/60 mb-8 leading-relaxed max-w-lg">
                  Experience compassionate AI therapy that understands your emotions, 
                  tracks your wellness journey, and provides personalized support — 
                  anytime, anywhere, completely private.
                </p>

                <div className="flex flex-wrap gap-4 mb-10">
                  <Link href="/auth?mode=anonymous"
                    className="btn-primary px-8 py-4 rounded-2xl text-white font-semibold flex items-center gap-2 text-lg">
                    <MessageCircle className="w-5 h-5" />
                    Start Free Session
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/auth"
                    className="btn-secondary px-8 py-4 rounded-2xl text-white font-semibold flex items-center gap-2 text-lg">
                    <Shield className="w-5 h-5" />
                    Anonymous Mode
                  </Link>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-white/50">
                  {[
                    { icon: Lock, text: "100% Private" },
                    { icon: Shield, text: "End-to-End Encrypted" },
                    { icon: Heart, text: "Crisis Support" },
                    { icon: Globe, text: "Multi-Language" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-purple-400" />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right - AI Avatar + Breathing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col items-center gap-8"
            >
              <AIAvatar size="large" mood="calm" />
              
              {/* Floating quote card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="glass-card p-6 rounded-2xl max-w-sm w-full"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white/90 text-sm leading-relaxed italic">
                      "I'm here to listen, understand, and support you through every emotion. 
                      You're not alone in this journey."
                    </p>
                    <p className="text-purple-400 text-xs mt-2 font-medium">— MindCare AI</p>
                  </div>
                </div>
              </motion.div>

              {/* Breathing guide */}
              <div className="glass p-4 rounded-2xl flex items-center gap-4">
                <BreathingCircle size="small" />
                <div>
                  <p className="text-white text-sm font-medium">Feeling stressed?</p>
                  <p className="text-white/50 text-xs">Try our breathing exercise</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 rounded-full bg-purple-400 animate-bounce" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Mood Preview */}
      <MoodPreview />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Privacy Section */}
      <section id="privacy" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Your Privacy is Our <span className="gradient-text">Priority</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              We take your mental health data seriously. Everything is encrypted, 
              anonymous, and under your complete control.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "End-to-End Encryption",
                description: "All conversations are encrypted. Even we cannot read your private sessions.",
                color: "purple"
              },
              {
                icon: Shield,
                title: "Anonymous Mode",
                description: "Use MindCare without creating an account. No personal data required.",
                color: "cyan"
              },
              {
                icon: Users,
                title: "GDPR Compliant",
                description: "Delete your account and all data permanently at any time.",
                color: "green"
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 rounded-2xl"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-500/20 flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 rounded-3xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-cyan-500/10" />
            <div className="relative z-10">
              <div className="text-6xl mb-6">🧠</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Start Your Healing Journey Today
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of people who have found comfort, clarity, and growth 
                with MindCare AI. Your first session is completely free.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/auth?mode=register"
                  className="btn-primary px-8 py-4 rounded-2xl text-white font-semibold text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Begin Free Session
                </Link>
                <Link href="/auth?mode=anonymous"
                  className="btn-secondary px-8 py-4 rounded-2xl text-white font-semibold text-lg">
                  Try Anonymously
                </Link>
              </div>
              <p className="text-white/40 text-sm mt-6">
                No credit card required • 100% private • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">MindCare AI</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Your compassionate AI mental health companion, available 24/7.
              </p>
            </div>
            {[
              { title: "Platform", links: ["Chat", "Mood Tracker", "Journal", "Analytics"] },
              { title: "Support", links: ["Crisis Help", "Resources", "FAQ", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "GDPR", "Security"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/50 hover:text-white text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © 2024 MindCare AI. Not a substitute for professional medical advice.
            </p>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Heart className="w-4 h-4 text-red-400" />
              <span>Built with care for mental wellness</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
