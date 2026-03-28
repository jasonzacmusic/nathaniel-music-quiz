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

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Retrieve results from sessionStorage
    const storedResults = sessionStorage.getItem("quizResults");
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        setIsLoading(false);

        // Trigger confetti for good scores
        if (parsedResults.score / parsedResults.total >= 0.6) {
          setTimeout(() => setTriggerConfetti(true), 500);
        }
      } catch (error) {
        console.error("Error parsing results:", error);
        router.push("/");
      }
    } else {
      // No results found, redirect to home
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (!results) return;

    // Animate score count-up
    const targetScore = results.score;
    const duration = 2000;
    const startTime = Date.now();

    const animateScore = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentScore = Math.floor(progress * targetScore);
      setDisplayScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animateScore);
      } else {
        setDisplayScore(targetScore);
      }
    };

    animateScore();
  }, [results]);

  if (isLoading || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const percentage = Math.round((results.score / results.total) * 100);
  const tier = getScoreTier(percentage);
  const averageTimePerQuestion = Math.round(
    results.timeElapsed / results.total
  );

  const getRingColor = () => {
    if (percentage === 100) return "text-yellow-500";
    if (percentage >= 90) return "text-purple-500";
    if (percentage >= 80) return "text-blue-500";
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 60) return "text-cyan-500";
    if (percentage >= 50) return "text-orange-500";
    return "text-rose";
  };

  const getBackgroundGradient = () => {
    if (percentage === 100)
      return "from-yellow-500/20 to-yellow-600/10";
    if (percentage >= 90) return "from-purple-500/20 to-purple-600/10";
    if (percentage >= 80) return "from-blue-500/20 to-blue-600/10";
    if (percentage >= 70) return "from-green-500/20 to-green-600/10";
    if (percentage >= 60) return "from-cyan-500/20 to-cyan-600/10";
    if (percentage >= 50) return "from-orange-500/20 to-orange-600/10";
    return "from-rose/20 to-rose/10";
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-dark-bg to-dark-bg ${getBackgroundGradient()} flex flex-col`}>
      {/* Confetti */}
      <Confetti trigger={triggerConfetti} />

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 md:mb-12"
          >
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">
              Quiz Complete!
            </p>
            <h1 className="text-4xl md:text-5xl font-display font-700 text-white">
              {tier.message}
            </h1>
          </motion.div>

          {/* Score Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-8 md:mb-12"
          >
            <div className="relative w-48 h-48 md:w-56 md:h-56">
              {/* Background circle */}
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-90"
                viewBox="0 0 200 200"
              >
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
              </svg>

              {/* Progress circle */}
              <motion.svg
                className="absolute inset-0 w-full h-full transform -rotate-90"
                viewBox="0 0 200 200"
                initial={{ strokeDashoffset: 565 }}
                animate={{ strokeDashoffset: 565 - (percentage / 100) * 565 }}
                transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeDasharray="565"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="scoreGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </motion.svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                  >
                    <span className="text-5xl md:text-6xl">{tier.emoji}</span>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className={`text-4xl md:text-5xl font-display font-700 ${getRingColor()} mt-2`}
                  >
                    {displayScore}/{results.total}
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                    className="text-2xl md:text-3xl font-display font-700 text-white mt-1"
                  >
                    {percentage}%
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12"
          >
            {/* Time */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-4 md:p-6 border border-white/10">
              <p className="text-xs md:text-sm text-slate-500 uppercase tracking-wide mb-2">
                Total Time
              </p>
              <p className="text-2xl md:text-3xl font-display font-700 text-white">
                {formatTime(results.timeElapsed)}
              </p>
            </div>

            {/* Avg Time per Question */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-4 md:p-6 border border-white/10">
              <p className="text-xs md:text-sm text-slate-500 uppercase tracking-wide mb-2">
                Avg / Question
              </p>
              <p className="text-2xl md:text-3xl font-display font-700 text-electric-violet">
                {averageTimePerQuestion}s
              </p>
            </div>

            {/* Correct */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-4 md:p-6 border border-white/10">
              <p className="text-xs md:text-sm text-slate-500 uppercase tracking-wide mb-2">
                Correct
              </p>
              <p className="text-2xl md:text-3xl font-display font-700 text-warm-amber">
                {results.score}
              </p>
            </div>

            {/* Incorrect */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-4 md:p-6 border border-white/10">
              <p className="text-xs md:text-sm text-slate-500 uppercase tracking-wide mb-2">
                Incorrect
              </p>
              <p className="text-2xl md:text-3xl font-display font-700 text-rose">
                {results.total - results.score}
              </p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Try Again Button */}
            {results.setId !== "random" && results.setId !== "challenge" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  sessionStorage.removeItem("quizResults");
                  router.push(`/quiz/${results.setId}`);
                }}
                className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-warm-amber/80 to-rose/60 text-dark-bg font-display font-700 hover:shadow-lg transition-all"
              >
                <RotateCw className="w-5 h-5" />
                Try Again
              </motion.button>
            )}

            {/* Challenge Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sessionStorage.removeItem("quizResults");
                router.push("/challenge");
              }}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-electric-violet to-deep-purple text-white font-display font-700 hover:shadow-glow-purple transition-all"
            >
              <Zap className="w-5 h-5" />
              New Challenge
            </motion.button>

            {/* Home Button */}
            <Link
              href="/"
              onClick={() => sessionStorage.removeItem("quizResults")}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-display font-700 transition-all"
            >
              <Home className="w-5 h-5" />
              Home
            </Link>
          </motion.div>

          {/* Encouragement Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-8 md:mt-12 text-center"
          >
            <p className="text-slate-400 text-sm md:text-base">
              {percentage >= 90
                ? "Outstanding performance! You're a music theory master!"
                : percentage >= 80
                ? "Great job! Keep practicing to reach perfection!"
                : percentage >= 70
                ? "Good effort! Review the material and try again!"
                : "Nice try! Every quiz is a step towards mastery!"}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
