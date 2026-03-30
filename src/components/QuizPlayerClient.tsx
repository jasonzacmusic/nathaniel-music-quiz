"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Clock, ArrowRight, CheckCircle, Volume2, VolumeX, Play, ExternalLink } from "lucide-react";
import { QuestionWithShuffledAnswers } from "@/lib/queries";
import { useQuiz } from "@/hooks/useQuiz";
import { useOverlay } from "@/hooks/useOverlay";
import { formatTime } from "@/lib/utils";
import VideoPlayer from "./VideoPlayer";
import AnswerButton from "./AnswerButton";
import Confetti from "./Confetti";

interface QuizPlayerClientProps {
  questions: QuestionWithShuffledAnswers[];
  setId: string;
}

export default function QuizPlayerClient({ questions, setId }: QuizPlayerClientProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
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

  useOverlay(setId);
  const [isMuted, setIsMuted] = useState(true);
  const [showPostAnswer, setShowPostAnswer] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [flashState, setFlashState] = useState<"none" | "correct" | "wrong">("none");
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnswers(true), 400);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (answered) {
      if (isCorrect) {
        setTriggerConfetti(true);
        setFlashState("correct");
        setTimeout(() => setFlashState("none"), 600);
        setTimeout(() => setShowPostAnswer(true), 600);
      } else {
        setFlashState("wrong");
        setTimeout(() => setFlashState("none"), 600);
        setTimeout(() => setShowPostAnswer(true), 400);
      }
    }
  }, [answered, isCorrect]);

  useEffect(() => {
    if (!answered) {
      setShowPostAnswer(false);
      setTriggerConfetti(false);
      setShowAnswers(false);
    }
  }, [currentIndex, answered]);

  // Auto-scroll bottom content into view when post-answer content appears
  useEffect(() => {
    if (showPostAnswer) {
      setTimeout(() => {
        bottomRef.current?.scrollTo({ top: bottomRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [showPostAnswer]);

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progress = (currentIndex + (answered ? 1 : 0)) / totalQuestions;

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion && answered) {
      const resultData = { score, total: totalQuestions, timeElapsed, setId };
      sessionStorage.setItem("quizResults", JSON.stringify(resultData));
      router.push("/results");
    } else {
      nextQuestion();
    }
  }, [isLastQuestion, answered, score, totalQuestions, timeElapsed, setId, router, nextQuestion]);

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
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#080D1A]">
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
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-black">
      <Confetti trigger={triggerConfetti} />

      {/* ═══ FULLSCREEN VIDEO — fills entire screen, no gaps ═══ */}
      <VideoPlayer
        key={`video-${currentIndex}`}
        videoUrl={currentQuestion.video_url}
        isMuted={isMuted}
        className="absolute inset-0 w-full h-full"
      />

      {/* Flash overlay */}
      <AnimatePresence>
        {flashState !== "none" && (
          <motion.div
            className="absolute inset-0 z-[60] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              background: flashState === "correct"
                ? "radial-gradient(ellipse at center 80%, rgba(16,185,129,0.3) 0%, transparent 70%)"
                : "radial-gradient(ellipse at center 80%, rgba(244,63,94,0.3) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ ALL UI — overlaid directly on the video ═══ */}
      <div
        ref={bottomRef}
        className="absolute inset-0 z-10 flex flex-col overflow-y-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {/* ─── TOP BAR ─── */}
        <div className="relative z-30 flex-shrink-0">
          {/* Progress bar */}
          <div className="h-1 w-full bg-white/10">
            <motion.div
              className="h-full rounded-r-full"
              style={{ background: "linear-gradient(90deg, #7C3AED, #06B6D4)" }}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => router.push("/")}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 active:bg-black/60"
              aria-label="Exit quiz"
            >
              <ChevronLeft className="w-5 h-5 text-white/70" />
              <span className="text-xs text-white/50 hidden sm:block">Exit</span>
            </motion.button>

            <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10">
              <span className="text-sm sm:text-base font-display font-700 text-white">
                {currentIndex + 1}
                <span className="text-white/40 font-normal"> / {totalQuestions}</span>
              </span>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs sm:text-sm tabular-nums text-white/50">{formatTime(timeElapsed)}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10">
              <span className="font-display font-700 text-base sm:text-lg text-amber-400">{score}</span>
              <span className="text-white/30 text-sm">/</span>
              <span className="text-white/40 text-sm">{currentIndex + (answered ? 1 : 0)}</span>
              {streak >= 2 && (
                <motion.span
                  key={`streak-${streak}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-0.5 text-sm"
                >
                  <span className="text-amber-400 font-display font-700">{streak}</span>
                  <span className="ml-0.5">🔥</span>
                </motion.span>
              )}
            </div>
          </div>
        </div>

        {/* SPACER — pushes everything to the bottom */}
        <div className="flex-1 min-h-0" />

        {/* ─── BOTTOM SECTION: everything overlaid on video ─── */}
        <div className="relative flex-shrink-0">
          {/* Gradient scrim */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none"
            style={{
              height: "160%",
              background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.95) 80%, rgba(0,0,0,0.98) 100%)",
            }}
          />

          <div className="relative z-10 w-full max-w-2xl mx-auto px-3 pb-4 sm:px-5 sm:pb-6 pt-12">
            {/* Question text + mute button */}
            <div className="flex items-start gap-3 mb-3">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`q-${currentIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex-1 font-display font-700 text-[15px] sm:text-lg md:text-xl text-white leading-snug"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
                >
                  {currentQuestion.question_text}
                </motion.h2>
              </AnimatePresence>

              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsMuted((m) => !m)}
                className={`flex-shrink-0 relative z-40 flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full backdrop-blur-xl border-2 transition-all duration-200 active:scale-90 ${
                  isMuted
                    ? "bg-white/15 border-white/25 text-white/70"
                    : "bg-violet-500/30 border-violet-400/50 text-white"
                }`}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
                {isMuted && (
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/50 whitespace-nowrap font-medium">
                    tap
                  </span>
                )}
              </motion.button>
            </div>

            {/* Answer buttons */}
            <AnimatePresence mode="wait">
              {showAnswers && (
                <motion.div
                  key={`answers-${currentIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ POST-ANSWER: result + YouTube + Patreon + Next — all inside the video ═══ */}
            <AnimatePresence>
              {showPostAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 space-y-2.5"
                >
                  {/* Correct / Wrong banner */}
                  <div className={`rounded-xl p-3 border flex items-center gap-3 backdrop-blur-md ${
                    isCorrect
                      ? "bg-emerald-500/15 border-emerald-500/30"
                      : "bg-rose-500/15 border-rose-500/30"
                  }`}>
                    <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                      isCorrect ? "bg-emerald-500/25 text-emerald-400" : "bg-rose-500/25 text-rose-400"
                    }`}>
                      {isCorrect ? "✓" : "✗"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium">
                        {isCorrect ? "Correct!" : "The answer was"}
                      </p>
                      <p className="text-sm font-display font-700 text-amber-400 break-words leading-tight">
                        {currentQuestion.correct_answer}
                      </p>
                      {!isCorrect && selectedAnswer && selectedAnswer !== currentQuestion.correct_answer && (
                        <p className="text-[11px] text-white/40 mt-0.5">
                          You picked: <span className="text-rose-400">{selectedAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* YouTube + Patreon row */}
                  {(currentQuestion.youtube_url || currentQuestion.patreon_url) && (
                    <div className="flex gap-2">
                      {currentQuestion.youtube_url && (
                        <a
                          href={currentQuestion.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center gap-2.5 rounded-xl p-2.5 sm:p-3 border border-red-500/30 bg-red-600/20 backdrop-blur-md hover:bg-red-600/30 transition-all"
                        >
                          <div className="flex-shrink-0 p-1.5 bg-white rounded-lg">
                            <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-[10px] font-medium text-red-200/80 uppercase tracking-wide">
                              Full lesson
                            </p>
                            <p className="text-xs sm:text-sm font-display font-700 text-white truncate">
                              {currentQuestion.youtube_title || "Watch on YouTube"}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                        </a>
                      )}

                      {currentQuestion.patreon_url && (
                        <a
                          href={currentQuestion.patreon_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center gap-2.5 rounded-xl p-2.5 sm:p-3 border border-orange-500/30 bg-orange-600/20 backdrop-blur-md hover:bg-orange-600/30 transition-all"
                        >
                          <div className="flex-shrink-0 p-1.5 bg-white rounded-lg">
                            <svg className="w-3.5 h-3.5 text-orange-600 fill-orange-600" viewBox="0 0 24 24">
                              <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-[10px] font-medium text-orange-200/80 uppercase tracking-wide">
                              Support
                            </p>
                            <p className="text-xs sm:text-sm font-display font-700 text-white truncate">
                              Patreon extras
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Next / Results button */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNextQuestion}
                    className="w-full py-3.5 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2 active:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #7C3AED, #4C1D95, #06b6d4)",
                      boxShadow: "0 0 24px rgba(124,58,237,0.35)",
                    }}
                  >
                    {isLastQuestion ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        See My Results
                      </>
                    ) : (
                      <>
                        Next Question
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
