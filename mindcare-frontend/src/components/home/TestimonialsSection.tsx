"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya S.",
    role: "College Student",
    avatar: "👩‍🎓",
    text: "MindCare AI helped me through my exam anxiety. The breathing exercises and personalized support made a huge difference. I feel understood.",
    rating: 5,
    emotion: "Anxiety Relief"
  },
  {
    name: "Rahul M.",
    role: "Software Engineer",
    avatar: "👨‍💻",
    text: "I was skeptical about AI therapy, but this feels genuinely empathetic. It remembers my stress triggers and gives relevant advice every time.",
    rating: 5,
    emotion: "Stress Management"
  },
  {
    name: "Ananya K.",
    role: "Working Professional",
    avatar: "👩‍💼",
    text: "The anonymous mode gave me the courage to open up. No judgment, just support. The mood tracking helped me see patterns I never noticed.",
    rating: 5,
    emotion: "Depression Support"
  },
  {
    name: "Vikram P.",
    role: "Parent",
    avatar: "👨‍👧",
    text: "During a really dark time, MindCare AI's crisis support was there for me. It connected me with helplines and stayed with me through breathing exercises.",
    rating: 5,
    emotion: "Crisis Support"
  },
  {
    name: "Meera T.",
    role: "Teacher",
    avatar: "👩‍🏫",
    text: "The sleep therapy mode transformed my bedtime routine. I sleep better and feel more emotionally balanced. Highly recommend!",
    rating: 5,
    emotion: "Sleep Therapy"
  },
  {
    name: "Arjun N.",
    role: "Entrepreneur",
    avatar: "👨‍💼",
    text: "The motivation mode is incredible. When I'm feeling low, it gives me personalized encouragement that actually resonates with my situation.",
    rating: 5,
    emotion: "Motivation"
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Real Stories, Real <span className="gradient-text">Healing</span>
          </h2>
          <p className="text-white/60 text-lg">
            Thousands of people have found comfort and growth with MindCare AI
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/30 to-cyan-500/30 flex items-center justify-center text-2xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold">{t.name}</p>
                  <p className="text-white/50 text-sm">{t.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed mb-4 italic">
                "{t.text}"
              </p>

              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-600/20 border border-purple-500/30">
                <span className="text-purple-400 text-xs">{t.emotion}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
