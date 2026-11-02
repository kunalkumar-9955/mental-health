"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, Heart, Wind, X } from "lucide-react";
import BreathingCircle from "@/components/ui/BreathingCircle";

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
  severity?: string;
}

const helplines = [
  { name: "iCall (India)", number: "9152987821", hours: "8am-10pm Mon-Sat" },
  { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7" },
  { name: "AASRA", number: "9820466627", hours: "24/7" },
  { name: "Snehi", number: "044-24640050", hours: "8am-10pm" },
];

export default function CrisisModal({ isOpen, onClose, severity = "medium" }: CrisisModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full max-w-lg crisis-overlay rounded-3xl p-8 relative"
            style={{
              animation: "crisisPulse 2s ease-in-out infinite",
              boxShadow: "0 0 60px rgba(239,68,68,0.3)",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                💙
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">
                You Are Not Alone
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                I hear you, and I'm concerned about your wellbeing. 
                Please know that help is available right now.
              </p>
            </div>

            {/* Breathing Exercise */}
            <div className="flex flex-col items-center mb-6 p-4 glass rounded-2xl">
              <p className="text-white/80 text-sm mb-4 font-medium">
                <Wind className="w-4 h-4 inline mr-1 text-cyan-400" />
                Let's breathe together first
              </p>
              <BreathingCircle size="medium" autoPlay={true} />
            </div>

            {/* Helplines */}
            <div className="mb-6">
              <p className="text-white/60 text-xs mb-3 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Crisis Helplines — Available Now
              </p>
              <div className="grid grid-cols-2 gap-2">
                {helplines.map((line) => (
                  <a
                    key={line.name}
                    href={`tel:${line.number}`}
                    className="glass p-3 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <p className="text-white text-xs font-medium group-hover:text-purple-300">{line.name}</p>
                    <p className="text-purple-400 text-sm font-bold">{line.number}</p>
                    <p className="text-white/40 text-xs">{line.hours}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Grounding exercise */}
            <div className="glass p-4 rounded-xl mb-4">
              <p className="text-white/80 text-sm font-medium mb-2">5-4-3-2-1 Grounding</p>
              <div className="space-y-1 text-xs text-white/60">
                <p>👁️ Name 5 things you can <strong className="text-white">SEE</strong></p>
                <p>✋ Name 4 things you can <strong className="text-white">TOUCH</strong></p>
                <p>👂 Name 3 things you can <strong className="text-white">HEAR</strong></p>
                <p>👃 Name 2 things you can <strong className="text-white">SMELL</strong></p>
                <p>👅 Name 1 thing you can <strong className="text-white">TASTE</strong></p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4" />
              I'm feeling a bit better, continue talking
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
