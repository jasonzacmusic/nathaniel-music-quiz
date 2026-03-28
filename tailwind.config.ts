import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "deep-purple": "#4C1D95",
        "electric-violet": "#7C3AED",
        "electric-cyan": "#06B6D4",
        "warm-amber": "#F59E0B",
        rose: "#F43F5E",
        "dark-bg": "#080D1A",
        "dark-surface": "#0F172A",
        "dark-elevated": "#162032",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
        slideUp: "slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        slideDown: "slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        shake: "shake 0.6s ease-in-out",
        "pulse-glow": "pulseGlow 2s infinite",
        "pulse-glow-cyan": "pulseGlowCyan 2.5s infinite",
        float: "float 3s ease-in-out infinite",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        bounce: "bounce 0.6s ease-in-out",
        waveform: "waveform 1.4s ease-in-out infinite",
        "spin-slow": "spin 8s linear infinite",
        "gradient-shift": "gradientShift 6s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0) rotate(0deg)" },
          "25%": { transform: "translateX(-8px) rotate(-1deg)" },
          "50%": { transform: "translateX(8px) rotate(1deg)" },
          "75%": { transform: "translateX(-8px) rotate(-1deg)" },
        },
        pulseGlow: {
          "0%, 100%": {
            "box-shadow": "0 0 20px rgba(124, 58, 237, 0.4), 0 0 60px rgba(124, 58, 237, 0.15)",
            opacity: "1",
          },
          "50%": {
            "box-shadow": "0 0 30px rgba(124, 58, 237, 0.7), 0 0 80px rgba(124, 58, 237, 0.3)",
            opacity: "0.9",
          },
        },
        pulseGlowCyan: {
          "0%, 100%": {
            "box-shadow": "0 0 20px rgba(6, 182, 212, 0.4), 0 0 60px rgba(6, 182, 212, 0.1)",
          },
          "50%": {
            "box-shadow": "0 0 30px rgba(6, 182, 212, 0.7), 0 0 80px rgba(6, 182, 212, 0.25)",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        waveform: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        gradientShift: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
      },
      boxShadow: {
        "glow-purple": "0 0 25px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.2)",
        "glow-amber": "0 0 25px rgba(245, 158, 11, 0.5), 0 0 60px rgba(245, 158, 11, 0.2)",
        "glow-rose": "0 0 25px rgba(244, 63, 94, 0.5), 0 0 60px rgba(244, 63, 94, 0.2)",
        "glow-cyan": "0 0 25px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.2)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(124, 58, 237, 0.1)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
