"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroStats {
  totalQuestions: number;
  totalSets: number;
  categories: number;
}

function EqBar({ delay, height }: { delay: number; height: number }) {
  return (
    <motion.div
      className="w-1 rounded-full bg-gradient-to-t from-purple-500 to-amber-400"
      animate={{
        height: [height * 0.3, height, height * 0.5, height * 0.8, height * 0.3],
      }}
      transition={{
        duration: 1.2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export default function HeroSection({ stats }: { stats: HeroStats }) {
  const [displayStats, setDisplayStats] = useState({ questions: 0, categories: 0 });

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayStats({
        questions: Math.floor(ease * stats.totalQuestions),
        categories: Math.floor(ease * stats.categories),
      });
      if (progress === 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [stats]);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,50,255,0.25),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.12),transparent)]" />
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      {/* Equalizer bars - left side */}
      <div className="absolute left-8 bottom-1/3 flex items-end gap-1 opacity-20">
        {[24, 40, 32, 48, 28, 36, 44, 20, 38].map((h, i) => (
          <EqBar key={`l-${i}`} delay={i * 0.1} height={h} />
        ))}
      </div>

      {/* Equalizer bars - right side */}
      <div className="absolute right-8 bottom-1/3 flex items-end gap-1 opacity-20">
        {[32, 44, 24, 40, 36, 28, 48, 32, 24].map((h, i) => (
          <EqBar key={`r-${i}`} delay={i * 0.1 + 0.5} height={h} />
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-slate-300 font-medium tracking-wide uppercase">
            Nathaniel School of Music
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display font-700 text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 leading-[1.05] tracking-tight"
        >
          <span className="text-white">Train Your</span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
            Musical Ear
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto mb-12 leading-relaxed"
        >
          Interactive ear training quizzes powered by real-world music examples from our YouTube lessons
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex items-center justify-center gap-8 md:gap-12 mb-14"
        >
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-display font-700 text-white">
              {displayStats.questions}
              <span className="text-purple-400">+</span>
            </div>
            <div className="text-xs md:text-sm text-slate-500 mt-1 uppercase tracking-wider">Questions</div>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-display font-700 text-white">
              {displayStats.categories}
            </div>
            <div className="text-xs md:text-sm text-slate-500 mt-1 uppercase tracking-wider">Categories</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/challenge">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="relative px-8 py-4 bg-white text-slate-900 font-display font-600 rounded-xl flex items-center justify-center gap-2.5 shadow-[0_0_40px_rgba(168,85,247,0.15)] hover:shadow-[0_0_60px_rgba(168,85,247,0.25)] transition-shadow"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Start Quiz
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })}
            className="px-8 py-4 border border-white/15 text-white font-display font-600 rounded-xl flex items-center justify-center gap-2.5 hover:bg-white/[0.04] transition-all backdrop-blur-sm"
          >
            Browse Categories
          </motion.button>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-20"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-5 h-8 rounded-full border border-white/20 mx-auto flex justify-center pt-1.5">
            <motion.div
              className="w-1 h-2 rounded-full bg-white/40"
              animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
