"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Brain, BarChart3, MessageCircle, BookOpen, 
  Moon, Settings, LogOut, Menu, X, Heart,
  Zap, User, Bell, Music2, Users, Shield, Sparkles
} from "lucide-react";
import { useStore } from "@/store/useStore";
import ParticleBackground from "@/components/ui/ParticleBackground";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { href: "/chat", icon: MessageCircle, label: "AI Chat" },
  { href: "/companion", icon: Sparkles, label: "AI Companion" },
  { href: "/mood", icon: Heart, label: "Mood Tracker" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/therapy", icon: Brain, label: "Therapy" },
  { href: "/wellness", icon: Zap, label: "Wellness Score" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dreams", icon: Moon, label: "Dream Analyzer" },
  { href: "/music", icon: Music2, label: "Music Therapy" },
  { href: "/therapists", icon: Users, label: "Therapists" },
  { href: "/safespace", icon: Shield, label: "Safe Space" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex relative">
      <ParticleBackground />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass border-r border-white/10 fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">MindCare AI</span>
          </Link>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/40 to-cyan-500/40 flex items-center justify-center">
              <User className="w-5 h-5 text-white/70" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.displayName || "Anonymous User"}
              </p>
              <p className="text-white/40 text-xs truncate">
                {user?.isAnonymous ? "Anonymous Mode 🔒" : user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
                  isActive
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-purple-400" : ""}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-400"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link href="/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold gradient-text">MindCare AI</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/70 hover:text-white">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-14 left-0 right-0 z-30 glass border-b border-white/10 p-4"
          >
            <nav className="grid grid-cols-3 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs transition-all ${
                    pathname === item.href
                      ? "bg-purple-600/20 text-purple-300"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 relative z-10">
        <div className="min-h-screen p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
