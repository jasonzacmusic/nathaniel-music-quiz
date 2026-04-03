"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, RotateCw, Zap, Share2, Heart } from "lucide-react";
import { getScoreTier, formatTime } from "@/lib/utils";
import { recordQuizResult, getLevel, type Achievement } from "@/lib/gamification";
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
  if (percentage === 100) return "Perfect across the board. Your ears are operating at a professional level.";
  if (percentage >= 90) return "Nearly flawless. You're catching details that most musicians miss.";
  if (percentage >= 80) return "You're hearing the theory in the music. That's the whole game.";
  if (percentage >= 70) return "Solid across the fundamentals. Keep pushing.";
  if (percentage >= 60) return "The patterns are clicking. Keep going.";
  if (percentage >= 40) return "Every listen builds pattern recognition. Come back tomorrow.";
  return "These questions are hard — that's by design. Come back tomorrow.";
};

function getShareUrl(setId: string) {
  if (setId !== "random" && setId !== "challenge") {
    return `https://quiz.nathanielschool.com/play/${setId}`;
  }
  return "https://quiz.nathanielschool.com";
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [xpGained, setXpGained] = useState(0);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [playerLevel, setPlayerLevel] = useState<ReturnType<typeof getLevel> | null>(null);
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null);
  const [dailyStreak, setDailyStreak] = useState(0);
  const gamificationDone = useRef(false);

  useEffect(() => {
    const storedResults = sessionStorage.getItem("quizResults");
    if (storedResults) {
      try {
        const parsed = JSON.parse(storedResults);
        if (
          typeof parsed.score !== "number" ||
          typeof parsed.total !== "number" ||
          typeof parsed.timeElapsed !== "number" ||
          typeof parsed.setId !== "string" ||
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

  // Record gamification
  useEffect(() => {
    if (!results || gamificationDone.current) return;
    gamificationDone.current = true;

    const quizType = results.setId.startsWith("piano") || results.setId.startsWith("bass") || results.setId.startsWith("whistle")
      ? "ear_training"
      : results.setId === "challenge" || results.setId === "random"
        ? "ear_training"
        : "music_theory";

    const result = recordQuizResult(results.score, results.total, results.bestStreak || 0, quizType);
    setXpGained(result.xpGained);
    setNewAchievements(result.newAchievements);
    setPlayerLevel(getLevel(result.stats.xp));
    setDailyStreak(result.stats.dailyStreak);

    // Show achievements one by one
    if (result.newAchievements.length > 0) {
      let i = 0;
      const showNext = () => {
        if (i < result.newAchievements.length) {
          setShowAchievement(result.newAchievements[i]);
          i++;
          setTimeout(() => { setShowAchievement(null); setTimeout(showNext, 300); }, 3000);
        }
      };
      setTimeout(showNext, 2000);
    }
  }, [results]);

  // Percentage animation
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

  const handleNativeShare = async () => {
    if (!results) return;
    const percentage = Math.round((results.score / results.total) * 100);
    const url = getShareUrl(results.setId);
    const text = `I scored ${percentage}% on the Nathaniel Music Quiz! Can you beat me?`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Nathaniel Music Quiz", text, url });
      } catch { /* user cancelled */ }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${text} ${url}`);
      alert("Score copied to clipboard!");
    }
  };

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
  const shareUrl = getShareUrl(results.setId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080D1A] via-[#0A0F1E] to-[#080D1A] flex flex-col relative overflow-hidden">
      <Confetti trigger={triggerConfetti} />

      {/* Achievement toast */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border-2 border-amber-500/40 bg-[#1a1510]/95 backdrop-blur-xl shadow-2xl shadow-amber-900/30"
          >
            <span className="text-3xl">{showAchievement.icon}</span>
            <div>
              <p className="text-amber-400 font-display font-700 text-sm">Achievement Unlocked!</p>
              <p className="text-white font-display font-600 text-base">{showAchievement.name}</p>
              <p className="text-stone-400 text-xs">{showAchievement.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${tData.glow}, transparent 70%)` }}
      />

      <div className="flex-1 flex items-center justify-center px-4 py-16 md:py-20">
        <div className="w-full max-w-xl">

          {/* Tier stamp */}
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, type: "spring" }} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border font-display font-700 text-sm tracking-[0.12em] uppercase"
              style={{ borderColor: `${tData.color}40`, backgroundColor: `${tData.color}10`, color: tData.color, boxShadow: `0 0 24px ${tData.glow}` }}>
              {tData.label}
            </div>
          </motion.div>

          {/* Score ring */}
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15, type: "spring" }} className="flex justify-center mb-8">
            <div className="relative w-52 h-52 md:w-60 md:h-60">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              </svg>
              <motion.svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200"
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}>
                <defs>
                  <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={tData.ring} />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="none" stroke="url(#ringGrad)" strokeWidth="10"
                  strokeDasharray={circumference} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${tData.glow})` }} />
              </motion.svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }} className="text-center">
                  <div className="text-5xl md:text-6xl font-display font-700 tabular-nums leading-none" style={{ color: tData.color }}>
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
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-display font-700 text-white mb-2">{tier.message}</h1>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">{copy}</p>
          </motion.div>

          {/* ═══ XP + Level ═══ */}
          {playerLevel && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="mb-6 p-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{playerLevel.icon}</span>
                  <div>
                    <p className="font-display font-700 text-sm text-white">{playerLevel.name}</p>
                    <p className="text-[10px] text-stone-500">Level {playerLevel.index + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-700 text-amber-400 text-lg">+{xpGained} XP</p>
                  {dailyStreak > 1 && (
                    <p className="text-[10px] text-orange-400 font-medium">{dailyStreak}-day streak!</p>
                  )}
                </div>
              </div>
              {playerLevel.nextLevel && (
                <div>
                  <div className="flex justify-between text-[10px] text-stone-600 mb-1">
                    <span>{playerLevel.name}</span>
                    <span>{playerLevel.nextLevel.name}</span>
                  </div>
                  <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${playerLevel.progress * 100}%` }}
                      transition={{ duration: 1.5, delay: 0.8 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ═══ New Achievements ═══ */}
          {newAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
              className="mb-6 flex flex-wrap gap-2 justify-center">
              {newAchievements.map(a => (
                <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.06]">
                  <span className="text-lg">{a.icon}</span>
                  <div>
                    <p className="text-xs font-display font-700 text-amber-300">{a.name}</p>
                    <p className="text-[10px] text-stone-500">{a.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Stats grid */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            className={`grid ${results.bestStreak ? "grid-cols-5" : "grid-cols-4"} gap-2 mb-6`}>
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

          {/* ═══ Share ═══ */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
            className="mb-6">
            <div className="grid grid-cols-3 gap-2">
              {/* Native share (mobile) / Copy link (desktop) */}
              <button onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-violet-500/30 bg-violet-500/[0.08] hover:bg-violet-500/[0.15] text-violet-300 text-sm font-display font-600 transition-all">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              {/* WhatsApp */}
              <a href={`https://wa.me/?text=${encodeURIComponent(`I scored ${percentage}% on the Nathaniel Music Quiz! Can you beat me? ${shareUrl}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-green-500/30 bg-green-500/[0.08] hover:bg-green-500/[0.15] text-green-300 text-sm font-display font-600 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              {/* Twitter/X */}
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scored ${percentage}% on the Nathaniel Music Quiz! Can you beat me?`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-sm font-display font-600 transition-all">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X / Twitter
              </a>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="flex flex-col gap-3 mb-8">
            <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              onClick={() => { sessionStorage.removeItem("quizResults"); router.push("/challenge"); }}
              className="w-full py-4 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #7C3AED, #4C1D95, #06b6d4)", boxShadow: "0 0 24px rgba(124,58,237,0.3)" }}>
              <Zap className="w-5 h-5" />
              Take Another Challenge
            </motion.button>

            <div className="grid grid-cols-2 gap-3">
              {results.setId !== "random" && results.setId !== "challenge" && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => { sessionStorage.removeItem("quizResults"); router.push(`/quiz/${results.setId}`); }}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-white font-display font-600 text-sm transition-all">
                  <RotateCw className="w-4 h-4" /> Try Again
                </motion.button>
              )}
              <Link href="/" onClick={() => sessionStorage.removeItem("quizResults")}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] text-white font-display font-600 text-sm transition-all ${
                  results.setId === "random" || results.setId === "challenge" ? "col-span-2" : ""
                }`}>
                <Home className="w-4 h-4" /> Back Home
              </Link>
            </div>
          </motion.div>

          {/* ═══ Support prompt — gentle, after value delivered ═══ */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
            className="border-t border-white/[0.04] pt-6">
            <div className="text-center">
              <p className="text-stone-500 text-sm mb-3">
                Enjoyed this quiz? Help us keep it free for everyone.
              </p>
              <Link
                href="/support"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-orange-500/25 bg-orange-500/[0.06] hover:bg-orange-500/[0.12] text-orange-300 font-display font-600 text-sm transition-all"
              >
                <Heart className="w-4 h-4" />
                Support Nathaniel School
              </Link>
              <p className="text-stone-700 text-xs mt-2">
                Every contribution helps us create more lessons and quizzes
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
