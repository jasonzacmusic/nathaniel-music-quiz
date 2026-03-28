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
        "warm-amber": "#F59E0B",
        rose: "#F43F5E",
        slate: "#1E293B",
        cream: "#FFFBEB",
        "dark-bg": "#0F172A",
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        fadeIn: "fadeIn 0.5s ease-out",
        slideUp: "slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        slideDown: "slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        shake: "shake 0.6s ease-in-out",
        "pulse-glow": "pulseGlow 2s infinite",
        float: "float 3s ease-in-out infinite",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        bounce: "bounce 0.6s ease-in-out",
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
            "box-shadow": "0 0 0 0 rgba(124, 58, 237, 0.7)",
            opacity: "1",
          },
          "50%": {
            "box-shadow": "0 0 0 10px rgba(124, 58, 237, 0)",
            opacity: "0.8",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.5)",
        "glow-amber": "0 0 20px rgba(245, 158, 11, 0.5)",
        "glow-rose": "0 0 20px rgba(244, 63, 94, 0.5)",
      },
    },
  },
  plugins: [],
};
export default config;
