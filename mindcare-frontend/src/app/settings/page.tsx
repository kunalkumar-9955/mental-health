"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Trash2, LogOut, Save, Moon, Sun } from "lucide-react";
import { useStore } from "@/store/useStore";
import { authAPI } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, toggleDarkMode, darkMode } = useStore();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await authAPI.updateProfile({ displayName });
      toast.success("Profile updated!");
    } catch (e) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await authAPI.deleteAccount();
      logout();
      toast.success("Account deleted permanently");
      router.push("/");
    } catch (e) {
      toast.error("Failed to delete account");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/60 text-sm mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Profile</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mindcare-input w-full px-4 py-3 rounded-xl text-sm"
                placeholder="Your name"
              />
            </div>
            {user?.email && (
              <div>
                <label className="text-white/70 text-sm mb-2 block">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mindcare-input w-full px-4 py-3 rounded-xl text-sm opacity-50 cursor-not-allowed"
                />
              </div>
            )}
            {user?.isAnonymous && (
              <div className="p-3 rounded-xl bg-purple-600/10 border border-purple-500/20">
                <p className="text-purple-300 text-sm">🔒 Anonymous Mode — Your identity is protected</p>
              </div>
            )}
            <button
              onClick={saveProfile}
              disabled={saving}
              className="btn-primary px-6 py-2.5 rounded-xl text-white text-sm flex items-center gap-2"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Appearance</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm">Dark Mode</p>
              <p className="text-white/50 text-xs">Toggle between dark and light theme</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition-all ${darkMode ? "bg-purple-600" : "bg-white/20"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform mx-0.5 ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="text-white font-semibold">Privacy & Security</h3>
          </div>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>End-to-end encryption enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>Data stored securely in encrypted database</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>No data shared with third parties</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>GDPR compliant data handling</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass-card p-6 rounded-2xl border border-red-500/20">
          <h3 className="text-red-400 font-semibold mb-4">Danger Zone</h3>
          <div className="space-y-3">
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm border border-white/10"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account Permanently
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-300 text-sm mb-3">
                  ⚠️ This will permanently delete your account and all data. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={deleteAccount}
                    className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-medium"
                  >
                    Yes, Delete Everything
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 rounded-xl glass text-white/70 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
