"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreDisplayProps {
  correct: number;
  total: number;
  streak: number;
}

export default function ScoreDisplay({
  correct,
  total,
  streak,
}: ScoreDisplayProps) {
  const [displayCorrect, setDisplayCorrect] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    setDisplayCorrect(correct);
  }, [correct]);

  useEffect(() => {
    setDisplayTotal(total);
  }, [total]);

  const percentage =
    total > 0 ? Math.round((displayCorrect / displayTotal) * 100) : 0;

  return (
    <motion.div
      className="flex items-center gap-4 md:gap-6 bg-white/5 backdrop-blur rounded-xl px-4 md:px-6 py-3 md:py-4 border border-white/10"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Score Counter */}
      <div className="flex items-baseline gap-1 md:gap-2">
        <motion.span
          key={`correct-${correct}`}
          className="font-display font-700 text-xl md:text-2xl text-warm-amber"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {displayCorrect}
        </motion.span>
        <span className="text-sm md:text-base text-slate-400">/</span>
        <motion.span
          key={`total-${total}`}
          className="text-sm md:text-base text-slate-400"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          {displayTotal}
        </motion.span>
      </div>

      {/* Percentage */}
      <div className="h-6 w-px bg-white/10" />
      <div className="flex items-center gap-2">
        <motion.span
          key={`percentage-${percentage}`}
          className="font-display font-600 text-lg md:text-xl text-electric-violet"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {percentage}%
        </motion.span>
      </div>

      {/* Streak Badge */}
      {streak >= 2 && (
        <motion.div
          key={`streak-${streak}`}
          className="h-6 w-px bg-white/10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {streak >= 2 && (
        <motion.div
          key={`streak-badge-${streak}`}
          className="flex items-center gap-1 md:gap-2 ml-1"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
        >
          <span className="text-lg md:text-xl">🔥</span>
          <span className="font-display font-700 text-sm md:text-base text-warm-amber">
            {streak}
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
