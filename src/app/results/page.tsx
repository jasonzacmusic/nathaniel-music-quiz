"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, RotateCw, Zap } from "lucide-react";
import { getScoreTier, formatTime } from "@/lib/utils";
import Confetti from "@/components/Confetti";

interface QuizResults {
  score: number;
  total: number;
  timeElapsed: number;
  setId: string;
}

const tierData = (percentage: number) => {
  if (percentage === 100) return { label: "PERFECT", color: "#F59E0B", glow: "rgba(245,158,11,0.3)", ring: "#F59E0B", bg: "from-amber-500/12" };
  if (percentage >= 90) return { label: "ELITE", color: "#a78bfa", glow: "rgba(139,92,246,0.3)", ring: "#8b5cf6", bg: "from-violet-500/12" };
  if (percentage >= 80) return { label: "SHARP", color: "#06B6D4", glow: "rgba(6,182,212,0.3)", ring: "#06B6D4", bg: "from-cyan-500/12" };
  if (percentage >= 70) return { label: "SOLID", color: "#34d399", glow: "rgba(52,211,153,0.3)", ring: "#10b981", bg: "from-emerald-500/12" };
  if (percentage >= 60) return { label: "GROWING", color: "#60a5fa", glow: "rgba(96,165,250,0.25)", ring: "#3b82f6", bg: "from-blue-500/10" };
  if (percentage >= 40) return { label: "LEARNING", color: "#fb923c", glow: "rgba(251,146,60,0.25)", ring: "#f97316", bg: "from-orange-500/10" };
  return { label: "KEEP GOING", color: "#fb7185", glow: "rgba(251,113,133,0.25)", ring: "#f43f5e", bg: "from-rose-500/10" };
};

const tierCopy = (percentage: number): string => {
  if (percentage === 100) return "Your ears don't miss a thing. That's rare.";
  if (percentage >= 90) return "You've been listening closely. It shows.";
  if (percentage >= 80) return "Solid ears, solid instincts. Nearly there.";
  if (percentage >= 70) return "You know more than you think. Keep listening.";
  if (percentage >= 60) return "Good foundation. The patterns are clicking.";
  if (percentage >= 40) return "Every session trains your ear a little more.";
  return "The first attempt is always the hardest. Come back.";
};

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("quizResults");
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        setResults(parsed);
        setIsLoading(false);
        if (parsed.score / parsed.total >= 0.6) {
          setTimeout(() => setTriggerConfetti(true), 600);
        }
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (!results) return;
    const target = Math.round((results.score / results.total) * 100);
    const duration = 1800;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPercentage(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayPercentage(target);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [results]);

  if (isLoading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D1A]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  const percentage = Math.round((results.score / results.total) * 100);
  const tier = getScoreTier(percentage);
  const tData = tierData(percentage);
  const copy = tierCopy(percentage);
  const avgTime = Math.round(results.timeElapsed / results.total);
  const circumference = 2 * Math.PI * 80;

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#080D1A] via-[#0A0F1E] to-[#080D1A] flex flex-col relative overflow-hidden`}>
      <Confetti trigger={triggerConfetti} />

      {/* Background radial glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${tData.glow}, transparent 70%)` }}
      />

      <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-20">
        <div className="w-full max-w-xl">

          {/* Tier stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full border font-display font-700 text-sm tracking-[0.12em] uppercase"
              style={{
                borderColor: `${tData.color}40`,
                backgroundColor: `${tData.color}10`,
                color: tData.color,
                boxShadow: `0 0 24px ${tData.glow}`,
              }}
            >
              <span className="text-base">{tier.emoji}</span>
              {tData.label}
            </div>
          </motion.div>

          {/* Score ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, type: "spring", stiffness: 150 }}
            className="flex justify-center mb-8"
          >
            <div className="relative w-52 h-52 md:w-60 md:h-60">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              </svg>
              <motion.svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 200 200"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
              >
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={tData.ring} />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100" cy="100" r="80"
                  fill="none"
                  stroke="url(#ringGrad)"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 8px ${tData.glow})` }}
                />
              </motion.svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="text-center"
                >
                  <div
                    className="text-5xl md:text-6xl font-display font-700 tabular-nums leading-none"
                    style={{ color: tData.color }}
                  >
                    {displayPercentage}%
                  </div>
                  <div className="text-slate-500 text-sm font-medium mt-1">
                    {results.score} / {results.total} correct
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="text-2xl md:text-3xl font-display font-700 text-white mb-2">
              {tier.message}
            </h1>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              {copy}
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="grid grid-cols-4 gap-2 mb-8"
          >
            {[
              { label: "Time", value: formatTime(results.timeElapsed), color: "text-white" },
              { label: "Per Q", value: `${avgTime}s`, color: "text-violet-400" },
              { label: "Correct", value: String(results.score), color: "text-amber-400" },
              { label: "Missed", value: String(results.total - results.score), color: "text-rose-400" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 font-medium">{stat.label}</p>
                <p className={`text-lg font-display font-700 ${stat.color} tabular-nums`}>{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sessionStorage.removeItem("quizResults");
                router.push("/challenge");
              }}
              className="w-full py-4 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #4C1D95, #06b6d4)",
                boxShadow: "0 0 24px rgba(124,58,237,0.3)",
              }}
            >
              <Zap className="w-5 h-5" />
              Take Another Challenge
            </motion.button>

            <div className="grid grid-cols-2 gap-3">
              {results.setId !== "random" && results.setId !== "challenge" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    sessionStorage.removeItem("quizResults");
                    router.push(`/quiz/${results.setId}`);
                  }}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-white font-display font-600 text-sm transition-all"
                >
                  <RotateCw className="w-4 h-4" />
                  Try Again
                </motion.button>
              )}
              <Link
                href="/"
                onClick={() => sessionStorage.removeItem("quizResults")}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-white font-display font-600 text-sm transition-all ${
                  results.setId === "random" || results.setId === "challenge" ? "col-span-2" : ""
                }`}
              >
                <Home className="w-4 h-4" />
                Back Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
