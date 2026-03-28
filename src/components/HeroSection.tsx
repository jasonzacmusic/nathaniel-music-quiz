"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Play, Sparkles } from "lucide-react";

interface HeroStats {
  totalQuestions: number;
  totalSets: number;
  categories: number;
}

export default function HeroSection({ stats }: { stats: HeroStats }) {
  const [displayStats, setDisplayStats] = useState({
    questions: 0,
    sets: 0,
    categories: 0,
  });

  useEffect(() => {
    const duration = 2000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setDisplayStats({
        questions: Math.floor(progress * stats.totalQuestions),
        sets: Math.floor(progress * stats.totalSets),
        categories: Math.floor(progress * stats.categories),
      });

      if (progress === 1) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [stats]);

  // Floating musical note elements
  const floatingNotes = [
    { emoji: "♪", delay: 0, x: 10, y: 20 },
    { emoji: "♫", delay: 0.5, x: 80, y: 10 },
    { emoji: "♪", delay: 1, x: 15, y: 70 },
    { emoji: "♫", delay: 0.3, x: 85, y: 60 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 50, 0],
            y: [0, 50, -50, 0],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Floating musical notes */}
      {floatingNotes.map((note, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl opacity-40"
          initial={{ x: `${note.x}%`, y: `${note.y}%`, rotate: 0 }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 6,
            delay: note.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {note.emoji}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="font-display font-700 text-5xl md:text-7xl lg:text-8xl mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-purple-300 to-purple-500 bg-clip-text text-transparent">
              Train Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-orange-300 to-orange-500 bg-clip-text text-transparent">
              Musical Ear
            </span>
          </h1>
        </motion.div>

        {/* Subtext */}
        <motion.p
          className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {displayStats.questions} questions • {displayStats.sets} sets • {displayStats.categories}{" "}
          categories
        </motion.p>

        {/* Stats Display */}
        <motion.div
          className="grid grid-cols-3 gap-4 md:gap-8 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="glass rounded-lg p-4 md:p-6">
            <motion.div className="text-3xl md:text-4xl font-display font-700 text-purple-400">
              {displayStats.questions}
            </motion.div>
            <div className="text-xs md:text-sm text-slate-400 mt-2">Questions</div>
          </div>
          <div className="glass rounded-lg p-4 md:p-6">
            <motion.div className="text-3xl md:text-4xl font-display font-700 text-orange-400">
              {displayStats.sets}
            </motion.div>
            <div className="text-xs md:text-sm text-slate-400 mt-2">Sets</div>
          </div>
          <div className="glass rounded-lg p-4 md:p-6">
            <motion.div className="text-3xl md:text-4xl font-display font-700 text-violet-400">
              {displayStats.categories}
            </motion.div>
            <div className="text-xs md:text-sm text-slate-400 mt-2">Categories</div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link href="/challenge">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-display font-600 rounded-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl transition-shadow"
            >
              <Play className="w-5 h-5" />
              Start Your Challenge
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 md:px-10 py-3 md:py-4 border-2 border-purple-500 text-white font-display font-600 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-500/10 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            Browse Categories
          </motion.button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="mt-16 flex justify-center"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="text-slate-400 text-sm">Scroll to explore</div>
        </motion.div>
      </div>
    </section>
  );
}
