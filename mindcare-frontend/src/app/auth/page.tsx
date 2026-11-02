"use client";

import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";
import ParticleBackground from "@/components/ui/ParticleBackground";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <ParticleBackground />
      <Suspense fallback={
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <AuthForm />
      </Suspense>
    </div>
  );
}
