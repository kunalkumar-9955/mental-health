"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Brain, Eye, EyeOff, Mail, Lock, User,
  ArrowRight, Shield, AlertCircle, CheckCircle, WifiOff
} from "lucide-react";
import { authAPI } from "@/lib/api";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser, setToken } = useStore();

  const initialMode = searchParams.get("mode") as "login" | "register" | "anonymous" | null;

  const [mode, setMode] = useState<"login" | "register" | "forgot">(
    initialMode === "register" ? "register" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ email: "", password: "", displayName: "" });

  // Start anonymous session immediately if mode=anonymous
  const [anonymousStarted, setAnonymousStarted] = useState(false);
  if (initialMode === "anonymous" && !anonymousStarted) {
    setAnonymousStarted(true);
    // handled below via useEffect-like pattern — just call it
  }

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address";
    }

    if (mode !== "forgot") {
      if (!form.password) {
        errors.password = "Password is required";
      } else if (form.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getReadableError = (error: any): string => {
    // Network error — server not running at all
    if (!error.response) {
      if (
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNREFUSED" ||
        error.message?.includes("Network Error")
      ) {
        return "Backend server is not running. Open a terminal and run: cd mindcare-backend && npm run dev";
      }
      return `Connection error: ${error.message}`;
    }

    const status = error.response.status;
    const data = error.response.data;

    // Validation errors array from express-validator
    if (data?.errors && Array.isArray(data.errors)) {
      return data.errors.map((e: any) => e.msg).join(". ");
    }

    // Single error message from backend (includes DB errors)
    if (data?.error) return data.error;
    if (data?.message) return data.message;

    switch (status) {
      case 400: return "Invalid input. Please check your details.";
      case 401: return "Incorrect email or password.";
      case 409: return "An account with this email already exists.";
      case 422: return "Validation failed. Check your email and password.";
      case 429: return "Too many attempts. Please wait a moment and try again.";
      case 503: return data?.error || "Database not connected. Whitelist your IP in MongoDB Atlas → Network Access.";
      case 500: return "Server error. Please try again in a moment.";
      default:  return `Error ${status}: ${data?.error || "Something went wrong"}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFieldErrors({});

    try {
      let response;

      if (mode === "login") {
        response = await authAPI.login({ email: form.email, password: form.password });
      } else if (mode === "register") {
        response = await authAPI.register({
          email: form.email,
          password: form.password,
          displayName: form.displayName.trim() || undefined,
        });
      } else {
        // forgot password
        await authAPI.forgotPassword(form.email);
        toast.success("If an account exists, a reset link has been sent.");
        setLoading(false);
        return;
      }

      const { token, user } = response.data;
      setToken(token);
      setUser(user);

      const name = user.displayName?.split(" ")[0] || "";
      toast.success(`Welcome${name ? `, ${name}` : ""}! 💙`);
      router.push("/dashboard");
    } catch (error: any) {
      const msg = getReadableError(error);
      toast.error(msg, { duration: 5000 });

      // Highlight specific fields if possible
      if (msg.toLowerCase().includes("email")) {
        setFieldErrors((p) => ({ ...p, email: msg }));
      } else if (msg.toLowerCase().includes("password")) {
        setFieldErrors((p) => ({ ...p, password: msg }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      const response = await authAPI.anonymous();
      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      toast.success("Anonymous session started. Your privacy is protected. 🔒");
      router.push("/chat");
    } catch (error: any) {
      toast.error(getReadableError(error), { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-4 relative z-10">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold gradient-text">MindCare AI</span>
        </Link>
        <p className="text-white/60 text-sm">Your compassionate AI mental health companion</p>
      </motion.div>

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-8 rounded-3xl"
      >
        {/* Mode Tabs */}
        <div className="flex gap-2 mb-6 p-1 glass rounded-xl">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setFieldErrors({}); }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? "bg-purple-600 text-white"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleSubmit}
            className="space-y-4"
            noValidate
          >
            {/* Display Name (register only) */}
            {mode === "register" && (
              <div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="mindcare-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={(e) => { setForm({ ...form, email: e.target.value }); clearFieldError("email"); }}
                  className={`mindcare-input w-full pl-10 pr-4 py-3 rounded-xl text-sm ${
                    fieldErrors.email ? "border-red-500/60" : ""
                  }`}
                  autoComplete="email"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            {mode !== "forgot" && (
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "register" ? "Password (min 6 characters)" : "Password"}
                    value={form.password}
                    onChange={(e) => { setForm({ ...form, password: e.target.value }); clearFieldError("password"); }}
                    className={`mindcare-input w-full pl-10 pr-10 py-3 rounded-xl text-sm ${
                      fieldErrors.password ? "border-red-500/60" : ""
                    }`}
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            )}

            {/* Forgot password link */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setFieldErrors({}); }}
                  className="text-purple-400 text-xs hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Back to login from forgot */}
            {mode === "forgot" && (
              <button
                type="button"
                onClick={() => { setMode("login"); setFieldErrors({}); }}
                className="text-purple-400 text-xs hover:text-purple-300 transition-colors"
              >
                ← Back to Sign In
              </button>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/40 text-xs">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Anonymous Login */}
        <button
          onClick={handleAnonymous}
          disabled={loading}
          className="btn-secondary w-full py-3 rounded-xl text-white font-medium flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          <Shield className="w-4 h-4 text-purple-400" />
          Continue Anonymously
          <span className="text-white/40 text-xs">(No account needed)</span>
        </button>

        <p className="text-center text-white/40 text-xs mt-4">
          By continuing, you agree to our{" "}
          <a href="#" className="text-purple-400 hover:underline">Terms</a> and{" "}
          <a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>
        </p>
      </motion.div>

      {/* Server status hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-3 p-3 rounded-xl border border-white/10 bg-white/5"
      >
        <p className="text-white/40 text-xs text-center mb-1 font-medium">To run the app locally:</p>
        <div className="space-y-1">
          <p className="text-white/40 text-xs font-mono text-center">
            <span className="text-purple-400">Terminal 1:</span> cd mindcare-backend &amp;&amp; npm run dev
          </p>
          <p className="text-white/40 text-xs font-mono text-center">
            <span className="text-cyan-400">Terminal 2:</span> cd mindcare-frontend &amp;&amp; npm run dev
          </p>
          <p className="text-white/40 text-xs text-center mt-1">
            MongoDB Atlas → Network Access → Allow <span className="text-yellow-400">0.0.0.0/0</span>
          </p>
        </div>
      </motion.div>

      {/* Crisis note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-center"
      >
        <p className="text-white/60 text-xs">
          🆘 In crisis? Call{" "}
          <a href="tel:9152987821" className="text-red-400 font-medium">iCall: 9152987821</a>
          {" "}or{" "}
          <a href="tel:18602662345" className="text-red-400 font-medium">Vandrevala: 1860-2662-345</a>
        </p>
      </motion.div>
    </div>
  );
}
