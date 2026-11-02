import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#7C3AED",
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          500: "#06B6D4",
          600: "#0891B2",
        },
        mindcare: {
          purple: "#7C3AED",
          blue: "#1E40AF",
          cyan: "#06B6D4",
          dark: "#0F0A1E",
          darker: "#080514",
          card: "rgba(255,255,255,0.05)",
          border: "rgba(255,255,255,0.1)",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #0F0A1E 0%, #1a0533 50%, #0a1628 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.1) 100%)",
        "glow-gradient": "radial-gradient(ellipse at center, rgba(124,58,237,0.3) 0%, transparent 70%)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "breathe": "breathe 4s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "bounce-slow": "bounce 3s infinite",
        "shimmer": "shimmer 2s linear infinite",
        "particle": "particle 8s ease-in-out infinite",
        "typing": "typing 1.5s steps(3) infinite",
        "crisis-pulse": "crisisPulse 1s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.15)", opacity: "1" },
        },
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(124,58,237,0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(124,58,237,0.8), 0 0 80px rgba(6,182,212,0.3)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        particle: {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)", opacity: "0.6" },
          "33%": { transform: "translateY(-30px) translateX(20px) scale(1.1)", opacity: "1" },
          "66%": { transform: "translateY(-10px) translateX(-20px) scale(0.9)", opacity: "0.8" },
        },
        typing: {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "1" },
        },
        crisisPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.7)" },
          "50%": { boxShadow: "0 0 0 20px rgba(239,68,68,0)" },
        }
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
