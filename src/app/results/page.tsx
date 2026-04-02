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
  bestStreak?: number;
  questionTimes?: number[];
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
  if (percentage === 100) return "Perfect across chord degrees, time signatures, and modes. Your ears are operating at a professional level.";
  if (percentage >= 90) return "Nearly flawless. You're catching extensions, borrowed chords, and odd meters that most musicians miss entirely.";
  if (percentage >= 80) return "Chord progressions, slash chords, complex rhythms — you're hearing the theory in the music. That's the whole game.";
  if (percentage >= 70) return "Solid across the fundamentals. The rarer modes and jazz extensions are the next frontier.";
  if (percentage >= 60) return "The chord progressions are clicking. Keep pushing on rhythm and modes — they'll land.";
  if (percentage >= 40) return "Every listen builds pattern recognition. The secondary dominants and time signatures will start to feel obvious.";
  return "These questions are hard — Mixolydian ♭6, 19/8, secondary dominants. That's by design. Come back tomorrow.";
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
        if (
          typeof parsed.score !== 'number' ||
          typeof parsed.total !== 'number' ||
          typeof parsed.timeElapsed !== 'number' ||
          typeof parsed.setId !== 'string' ||
          parsed.total <= 0
        ) {
          router.push("/");
          return;
        }
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
            className={`grid ${results.bestStreak ? "grid-cols-5" : "grid-cols-4"} gap-2 mb-8`}
          >
            {[
              { label: "Time", value: formatTime(results.timeElapsed), color: "text-white" },
              { label: "Per Q", value: `${avgTime}s`, color: "text-violet-400" },
              { label: "Correct", value: String(results.score), color: "text-amber-400" },
              { label: "Missed", value: String(results.total - results.score), color: "text-rose-400" },
              ...(results.bestStreak ? [{ label: "Streak", value: String(results.bestStreak), color: "text-orange-400" }] : []),
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1 font-medium">{stat.label}</p>
                <p className={`text-lg font-display font-700 ${stat.color} tabular-nums`}>{stat.value}</p>
              </div>
            ))}
          </motion.div>

          {/* Share results */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.72, duration: 0.5 }}
            className="flex justify-center gap-2 mb-2"
          >
            <a
              href={`https://twitter.com/intent/tweet?text=I+scored+${percentage}%25+on+the+Nathaniel+Music+Quiz+Can+you+beat+me%3F&url=https://quiz.nathanielschool.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/20 text-xs font-medium transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Share Score
            </a>
            <a
              href={`https://wa.me/?text=I+scored+${percentage}%25+on+the+Nathaniel+Music+Quiz+Try+it+here%3A+https://quiz.nathanielschool.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 hover:text-green-400 hover:border-green-500/20 text-xs font-medium transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
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
