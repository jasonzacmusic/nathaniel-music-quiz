"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroStats {
  totalQuestions: number;
  totalSets: number;
  categories: number;
}

interface CategoryInfo {
  name: string;
  count: number;
}

const WAVEFORM_HEIGHTS = [
  30, 55, 45, 80, 35, 70, 50, 90, 40, 65, 75, 45, 85, 55, 40, 70, 35, 60, 80, 50,
  55, 40, 75, 60, 30, 85, 50, 40, 70, 55, 45, 80, 60, 35, 75, 50, 90, 40, 65, 55,
  45, 70, 35, 80, 50, 60, 40, 75, 55, 45, 80, 35, 70, 50, 90, 40, 65, 55, 45, 70, 35, 80, 50, 60,
];

function WaveformVisualizer() {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-[3px] h-28 px-4 overflow-hidden pointer-events-none">
      {WAVEFORM_HEIGHTS.map((h, i) => {
        const delay = (i * 0.04) % 1.4;
        return (
          <div
            key={i}
            className="flex-1 max-w-[6px] rounded-t-full"
            style={{
              height: `${h}%`,
              background: `linear-gradient(to top, rgba(180,83,9,0.5), rgba(217,119,6,0.3))`,
              opacity: 0.3 + (h / 100) * 0.45,
              animation: `waveBar 1.4s ease-in-out ${delay}s infinite`,
              transformOrigin: "bottom",
            }}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a08] via-transparent to-transparent" />
    </div>
  );
}

function CategoryRotator({ categories }: { categories: CategoryInfo[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (categories.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % categories.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [categories.length]);

  if (categories.length === 0) return null;

  const current = categories[index];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-3 w-56"
    >
      <div className="flex items-center gap-2 px-1">
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
        </span>
        <span className="text-[10px] text-stone-500 uppercase tracking-[0.15em] font-medium">
          Test yourself on
        </span>
      </div>

      <Link
        href={`/category/${encodeURIComponent(current.name)}`}
        className="group block"
      >
        <div className="relative px-4 py-4 rounded-2xl border border-amber-900/30 bg-amber-900/[0.06] backdrop-blur-sm hover:border-amber-700/40 hover:bg-amber-900/[0.1] transition-all duration-300 overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-700/10 rounded-full blur-2xl group-hover:bg-amber-700/20 transition-colors duration-500" />

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-sm font-display font-700 text-white mb-1 leading-snug">
                  {current.name}
                </div>
                <div className="text-[11px] text-stone-500">
                  {current.count} question{current.count !== 1 ? "s" : ""}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="absolute right-3 bottom-3 flex items-end gap-[2px] h-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={`${index}-${i}`}
                className="w-[3px] rounded-full bg-amber-600/60"
                animate={{ height: ["4px", "14px", "6px", "12px", "4px"] }}
                transition={{ duration: 1.2, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </div>
        </div>
      </Link>

      <div className="flex justify-center gap-1.5 px-1">
        {categories.slice(0, 6).map((_, i) => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full transition-all duration-300 ${
              i === index % Math.min(categories.length, 6)
                ? "bg-amber-500 w-3"
                : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function HeroSection({ stats, categories = [] }: { stats: HeroStats; categories?: CategoryInfo[] }) {
  const [displayStats, setDisplayStats] = useState({ questions: 0, categories: 0, sets: 0 });

  useEffect(() => {
    const duration = 2200;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayStats({
        questions: Math.floor(ease * stats.totalQuestions),
        categories: Math.floor(ease * stats.categories),
        sets: Math.floor(ease * stats.totalSets),
      });
      if (progress === 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [stats]);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#0a0a08]">

      {/* Warm background glows */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(180,83,9,0.2),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(120,53,15,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_15%_75%,rgba(146,64,14,0.08),transparent)]" />
      </div>
      <div className="absolute inset-0 noise-overlay" />

      {/* Top shimmer line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-700/50 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-32 pt-24">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-amber-800/30 bg-amber-900/[0.1] backdrop-blur-sm mb-10"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-xs text-stone-400 font-medium tracking-[0.12em] uppercase">
            Nathaniel School of Music
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12 }}
          className="font-display leading-[1.0] tracking-tight mb-8"
        >
          <span className="block text-stone-300 font-300 text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-2">
            Hear It.
          </span>
          <span
            className="block text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-700"
            style={{
              background: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 30%, #d97706 60%, #b45309 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Name It.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28 }}
          className="text-lg md:text-xl text-stone-500 max-w-xl mx-auto mb-12 leading-relaxed font-300"
        >
          Not &ldquo;major or minor.&rdquo; More like:{" "}
          <span className="text-stone-300 font-500">Mixolydian &#x266D;6 or Dorian? 7&#x266D;9 or plain dominant? 11/8 or 19/8?</span>{" "}
          Watch the clip, trust your ear, pick the answer.
        </motion.p>

        {/* Stats tape */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
          className="inline-flex items-stretch divide-x divide-amber-900/30 border border-amber-900/25 rounded-2xl bg-amber-900/[0.06] backdrop-blur-sm mb-14 overflow-hidden"
        >
          {[
            { value: displayStats.questions, suffix: "+", label: "Questions" },
            { value: displayStats.sets, suffix: "", label: "Quiz Sets" },
            { value: displayStats.categories, suffix: "", label: "Topics" },
          ].map((stat, i) => (
            <div key={i} className="px-6 py-3.5 text-center min-w-[90px]">
              <div className="text-2xl md:text-3xl font-display font-700 text-white tabular-nums">
                {stat.value}
                <span className="text-amber-500">{stat.suffix}</span>
              </div>
              <div className="text-[10px] text-stone-600 mt-0.5 uppercase tracking-widest font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.56 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/challenge">
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="relative group px-8 py-4 rounded-xl font-display font-700 text-base text-white flex items-center gap-3 overflow-hidden bg-amber-700 hover:bg-amber-600 transition-colors"
              style={{
                boxShadow: "0 0 30px rgba(180,83,9,0.35), 0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <motion.svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <path d="M8 5v14l11-7z" />
              </motion.svg>
              Start Quiz — It&apos;s Free
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 border border-stone-700 text-stone-300 font-display font-600 text-base rounded-xl flex items-center gap-2.5 hover:bg-white/[0.04] hover:border-stone-600 transition-all backdrop-blur-sm"
          >
            Browse Topics
            <svg className="w-4 h-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-12 flex items-center justify-center gap-6 text-xs text-stone-600"
        >
          {["No sign-up needed", "100% free", "Built from real lessons"].map((item, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-amber-700/60" />
              {item}
            </span>
          ))}
        </motion.div>

        <CategoryRotator categories={categories} />

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-36 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-5 h-8 rounded-full border border-stone-700 flex justify-center pt-1.5">
            <motion.div
              className="w-1 h-1.5 rounded-full bg-stone-600"
              animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>

      <WaveformVisualizer />
    </section>
  );
}
