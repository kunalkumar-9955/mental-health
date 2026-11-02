"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const stats = [
  { value: 50000, label: "Users Supported", suffix: "+", color: "text-purple-400" },
  { value: 98, label: "Satisfaction Rate", suffix: "%", color: "text-cyan-400" },
  { value: 24, label: "Hours Available", suffix: "/7", color: "text-green-400" },
  { value: 1000000, label: "Sessions Completed", suffix: "+", color: "text-pink-400" },
];

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatted = count >= 1000000 
    ? `${(count / 1000000).toFixed(1)}M`
    : count >= 1000 
    ? `${(count / 1000).toFixed(0)}K`
    : count.toString();

  return <span>{formatted}{suffix}</span>;
}

export default function StatsSection() {
  const [inView, setInView] = useState(false);

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card p-12 rounded-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onViewportEnter={() => setInView(true)}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-2">
              Trusted by Thousands Worldwide
            </h2>
            <p className="text-white/60">Real impact on real people's mental wellness</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className={`text-4xl lg:text-5xl font-black mb-2 ${stat.color}`}>
                  {inView ? <AnimatedNumber value={stat.value} suffix={stat.suffix} /> : "0"}
                </div>
                <p className="text-white/60 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
