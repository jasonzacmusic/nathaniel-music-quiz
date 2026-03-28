"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  const [prevStreak, setPrevStreak] = useState(0);
  const [showBounce, setShowBounce] = useState(false);

  useEffect(() => {
    if (streak > prevStreak && streak >= 2) {
      setShowBounce(true);
      const timer = setTimeout(() => setShowBounce(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevStreak(streak);
  }, [streak, prevStreak]);

  if (streak < 2) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        key={`streak-${streak}`}
        initial={{ scale: 0, y: -20 }}
        animate={{
          scale: 1,
          y: 0,
          ...(showBounce && {
            y: [0, -8, -4, 0],
          }),
        }}
        exit={{ scale: 0, y: -20 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          ...(showBounce && {
            y: { duration: 0.6 },
          }),
        }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-warm-amber/80 to-rose/60 text-dark-bg font-display font-700 shadow-lg"
      >
        <motion.span
          animate={{
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: showBounce ? 0 : Infinity,
            repeatDelay: 2,
          }}
          className="text-xl"
        >
          🔥
        </motion.span>
        <span className="text-lg">{streak}</span>
      </motion.div>
    </AnimatePresence>
  );
}
