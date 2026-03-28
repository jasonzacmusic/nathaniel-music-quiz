"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroStats {
  totalQuestions: number;
  totalSets: number;
  categories: number;
}

const WAVEFORM_HEIGHTS = [30, 55, 45, 80, 35, 70, 50, 90, 40, 65, 75, 45, 85, 55, 40, 70, 35, 60, 80, 50,
  55, 40, 75, 60, 30, 85, 50, 40, 70, 55, 45, 80, 60, 35, 75, 50, 90, 40, 65, 55,
  45, 70, 35, 80, 50, 60, 40, 75, 55, 45, 80, 35, 70, 50, 90, 40, 65, 55, 45, 70, 35, 80, 50, 60];

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
              background: `linear-gradient(to top, rgba(124,58,237,0.5), rgba(6,182,212,0.35))`,
              opacity: 0.4 + (h / 100) * 0.45,
              animation: `waveBar 1.4s ease-in-out ${delay}s infinite`,
              transformOrigin: "bottom",
            }}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-transparent to-transparent" />
    </div>
  );
}

function FloatingNote({ char, x, y, delay, size }: { char: string; x: string; y: string; delay: number; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: x, top: y, fontSize: size }}
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.15, 0.25, 0.1, 0],
        y: [-10, -40, -70, -90],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
        ease: "easeOut",
      }}
    >
      {char}
    </motion.div>
  );
}

const NOTES = [
  { char: "♩", x: "8%", y: "60%", delay: 0, size: 18 },
  { char: "♪", x: "15%", y: "45%", delay: 1.5, size: 14 },
  { char: "♫", x: "85%", y: "55%", delay: 0.8, size: 20 },
  { char: "♬", x: "92%", y: "40%", delay: 2.2, size: 16 },
  { char: "♩", x: "5%", y: "30%", delay: 3.5, size: 12 },
  { char: "♪", x: "95%", y: "70%", delay: 2.8, size: 15 },
];

export default function HeroSection({ stats }: { stats: HeroStats }) {
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
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-[#080D1A]">

      {/* Deep layered background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-10%,rgba(109,40,217,0.28),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(6,182,212,0.10),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_15%_75%,rgba(124,58,237,0.08),transparent)]" />
      </div>

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Top accent line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Floating musical notes */}
      {NOTES.map((note, i) => (
        <FloatingNote key={i} {...note} />
      ))}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-32 pt-24">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-violet-500/25 bg-violet-500/[0.06] backdrop-blur-sm mb-10"
        >
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs text-slate-300 font-medium tracking-[0.12em] uppercase">
            Nathaniel School of Music
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.12 }}
          className="font-display leading-[1.0] tracking-tight mb-8"
        >
          <span className="block text-white font-300 text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-2 opacity-90">
            Hear More.
          </span>
          <span
            className="block text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-800"
            style={{
              background: "linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 30%, #06b6d4 70%, #a5f3fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Play Better.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28 }}
          className="text-lg md:text-xl text-slate-400 max-w-lg mx-auto mb-12 leading-relaxed font-300"
        >
          Real ear training, real music. Every quiz is built from{" "}
          <span className="text-slate-300 font-500">actual YouTube lessons</span> — watch, listen, then prove what you know.
        </motion.p>

        {/* Stats tape */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
          className="inline-flex items-stretch divide-x divide-white/[0.08] border border-white/[0.08] rounded-2xl bg-white/[0.025] backdrop-blur-sm mb-14 overflow-hidden"
        >
          {[
            { value: displayStats.questions, suffix: "+", label: "Questions" },
            { value: displayStats.sets, suffix: "", label: "Quiz Sets" },
            { value: displayStats.categories, suffix: "", label: "Categories" },
          ].map((stat, i) => (
            <div key={i} className="px-6 py-3.5 text-center min-w-[90px]">
              <div className="text-2xl md:text-3xl font-display font-700 text-white">
                {stat.value}
                <span className="text-violet-400">{stat.suffix}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-widest font-medium">
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
              className="relative group px-8 py-4 rounded-xl font-display font-700 text-base text-white flex items-center gap-3 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #5b21b6, #06b6d4)",
                boxShadow: "0 0 30px rgba(124,58,237,0.4), 0 4px 20px rgba(0,0,0,0.3)",
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
              Start Training Now
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 border border-white/15 text-white font-display font-600 text-base rounded-xl flex items-center gap-2.5 hover:bg-white/[0.05] hover:border-white/25 transition-all backdrop-blur-sm"
          >
            Browse Categories
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Now Playing widget */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full" />
            <motion.div
              className="absolute inset-1 bg-[#080D1A] rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <div className="w-2 h-2 rounded-full bg-violet-400" />
            </motion.div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-0.5">Now Playing</div>
            <div className="text-xs text-white font-display font-600">Ear Training Vol. 1</div>
          </div>
          <div className="flex items-end gap-[2px] h-4 ml-1">
            {[1, 2, 3, 4].map((_, i) => (
              <motion.div
                key={i}
                className="w-[3px] bg-violet-400 rounded-full"
                style={{ height: "100%" }}
                animate={{ scaleY: [0.2, 1, 0.4, 0.8, 0.2] }}
                transition={{
                  duration: 1,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-36 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
              <motion.div
                className="w-1 h-1.5 rounded-full bg-white/50"
                animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full-width waveform */}
      <WaveformVisualizer />
    </section>
  );
}
