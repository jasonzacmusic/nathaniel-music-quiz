"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Clock } from "lucide-react";
import { QuestionWithShuffledAnswers } from "@/lib/queries";
import { useQuiz } from "@/hooks/useQuiz";
import { useOverlay } from "@/hooks/useOverlay";
import { formatTime } from "@/lib/utils";
import VideoPlayer from "./VideoPlayer";
import AnswerButton from "./AnswerButton";
import ScoreDisplay from "./ScoreDisplay";
import YouTubeCard from "./YouTubeCard";
import Confetti from "./Confetti";

interface QuizPlayerClientProps {
  questions: QuestionWithShuffledAnswers[];
  setId: string;
}

const WAVEFORM_DOTS = 20;

function WaveformProgress({ progress }: { progress: number }) {
  const filledCount = Math.round(progress * WAVEFORM_DOTS);
  return (
    <div className="flex items-center gap-[3px] w-full">
      {Array.from({ length: WAVEFORM_DOTS }).map((_, i) => {
        const filled = i < filledCount;
        const heights = [0.5, 0.8, 0.4, 1, 0.6, 0.9, 0.45, 0.7, 0.55, 0.85,
                        0.5, 0.75, 0.4, 0.95, 0.6, 0.8, 0.45, 1, 0.55, 0.7];
        const h = heights[i % heights.length];
        return (
          <motion.div
            key={i}
            className="flex-1 rounded-full transition-colors duration-300"
            style={{
              height: `${8 + h * 14}px`,
              background: filled
                ? "linear-gradient(to top, #7C3AED, #06B6D4)"
                : "rgba(255,255,255,0.07)",
            }}
            animate={filled ? { scaleY: [1, 1.15, 1] } : {}}
            transition={{ duration: 0.8, delay: i * 0.02, repeat: filled ? Infinity : 0, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

export default function QuizPlayerClient({ questions, setId }: QuizPlayerClientProps) {
  const router = useRouter();
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    streak,
    answered,
    selectedAnswer,
    isCorrect,
    timeElapsed,
    handleAnswer,
    nextQuestion,
  } = useQuiz({ questions });

  const { height: _height, blur: _blur } = useOverlay(setId); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [showYouTube, setShowYouTube] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [flashState, setFlashState] = useState<"none" | "correct" | "wrong">("none");

  useEffect(() => {
    if (answered) {
      if (isCorrect) {
        setTriggerConfetti(true);
        setFlashState("correct");
        setTimeout(() => setFlashState("none"), 600);
        setTimeout(() => setShowYouTube(true), 800);
      } else {
        setFlashState("wrong");
        setTimeout(() => setFlashState("none"), 600);
        setShowYouTube(true);
      }
    }
  }, [answered, isCorrect]);

  useEffect(() => {
    if (!answered) {
      setShowYouTube(false);
      setTriggerConfetti(false);
    }
  }, [currentIndex, answered]);

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progress = (currentIndex + (answered ? 1 : 0)) / totalQuestions;

  const handleNextQuestion = () => {
    if (isLastQuestion && answered) {
      const resultData = { score, total: totalQuestions, timeElapsed, setId };
      sessionStorage.setItem("quizResults", JSON.stringify(resultData));
      router.push("/results");
    } else {
      nextQuestion();
    }
  };

  // Determine the visual state of each answer button
  const getAnswerState = (answer: string): "default" | "correct" | "wrong" | "reveal" => {
    if (!answered || !currentQuestion) return "default";
    if (answer === currentQuestion.correct_answer) {
      return selectedAnswer === answer ? "correct" : "reveal";
    }
    if (answer === selectedAnswer) return "wrong";
    return "default";
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080D1A]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-cyan-400 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1A] flex flex-col">
      <Confetti trigger={triggerConfetti} />

      {/* Correct / Wrong flash */}
      <AnimatePresence>
        {flashState !== "none" && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              background: flashState === "correct"
                ? "radial-gradient(ellipse at center, rgba(16,185,129,0.18) 0%, transparent 70%)"
                : "radial-gradient(ellipse at center, rgba(244,63,94,0.18) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Waveform progress */}
      <div className="px-4 md:px-8 pt-5 pb-0">
        <div className="max-w-2xl mx-auto">
          <WaveformProgress progress={progress} />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 md:px-8 py-3 border-b border-white/[0.05]">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-colors group"
            aria-label="Exit quiz"
          >
            <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
            <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors hidden sm:block">Exit</span>
          </motion.button>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-xs font-medium tabular-nums text-slate-500">{formatTime(timeElapsed)}</span>
            <span className="text-xs text-slate-600 ml-2">
              <span className="text-white font-display font-600">{currentIndex + 1}</span>
              <span className="text-slate-600"> / {totalQuestions}</span>
            </span>
          </div>

          <ScoreDisplay correct={score} total={totalQuestions} streak={streak} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 md:py-8">
        <div className="w-full max-w-2xl flex flex-col gap-5">

          {/* ── VIDEO (full, clean) ── */}
          <motion.div
            key={`video-${currentIndex}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl overflow-hidden border border-white/[0.07] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          >
            <VideoPlayer videoUrl={currentQuestion.video_url} />
          </motion.div>

          {/* ── QUESTION + ANSWERS ── */}
          <motion.div
            key={`question-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5"
          >
            {/* Question text */}
            <h2 className="font-display font-700 text-lg md:text-xl text-white leading-snug mb-5">
              {currentQuestion.question_text}
            </h2>

            {/* Answer buttons */}
            <div className="space-y-2.5">
              {currentQuestion.answers.map((answer, index) => (
                <AnswerButton
                  key={`${answer}-${index}`}
                  text={answer}
                  onClick={() => handleAnswer(answer)}
                  state={getAnswerState(answer)}
                  index={index}
                  disabled={answered}
                />
              ))}
            </div>
          </motion.div>

          {/* ── POST-ANSWER SECTION ── */}
          <AnimatePresence mode="wait">
            {answered && (
              <motion.div
                key={`result-${currentIndex}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                {/* YouTube lesson card */}
                {showYouTube && currentQuestion.youtube_url && (
                  <YouTubeCard
                    title={currentQuestion.youtube_title}
                    url={currentQuestion.youtube_url}
                  />
                )}

                {/* Answer reveal banner */}
                <div className={`rounded-xl p-4 border flex items-start gap-3 ${
                  isCorrect
                    ? "bg-emerald-500/[0.07] border-emerald-500/20"
                    : "bg-rose-500/[0.07] border-rose-500/20"
                }`}>
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                    isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  }`}>
                    {isCorrect ? "✓" : "✗"}
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 mb-0.5 uppercase tracking-wider font-medium">
                      {isCorrect ? "Correct!" : "The answer was"}
                    </p>
                    <p className="text-sm font-display font-700 text-amber-400">
                      {currentQuestion.correct_answer}
                    </p>
                    {!isCorrect && selectedAnswer && selectedAnswer !== currentQuestion.correct_answer && (
                      <p className="text-xs text-slate-500 mt-1">
                        You picked: <span className="text-rose-400">{selectedAnswer}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Mini stats row */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Streak", value: streak > 0 ? `${streak} 🔥` : "—", color: "text-amber-400" },
                    {
                      label: "Accuracy",
                      value: `${totalQuestions > 0 ? Math.round(((score) / (currentIndex + 1)) * 100) : 0}%`,
                      color: "text-violet-400",
                    },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.06] text-center">
                      <p className="text-[10px] text-slate-600 mb-1 uppercase tracking-wider font-medium">{stat.label}</p>
                      <p className={`text-base font-display font-700 ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Next button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextQuestion}
                  className="w-full py-4 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #7C3AED, #4C1D95, #06b6d4)",
                    boxShadow: "0 0 24px rgba(124,58,237,0.35)",
                  }}
                >
                  {isLastQuestion ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      See My Results
                    </>
                  ) : (
                    <>
                      Next Question
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
