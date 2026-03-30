"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Clock, ArrowRight, CheckCircle, Volume2, VolumeX, Play } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);
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
    const timer = setTimeout(() => setShowAnswers(true), 300);
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

  useEffect(() => {
    if (showPostAnswer && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 150);
    } else if (!answered && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showPostAnswer, answered]);

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
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a08]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-amber-800/30" />
            <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 border-r-amber-600 animate-spin" />
          </div>
          <p className="text-stone-500 text-sm">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-black relative">
      {/* VIDEO */}
      <div className="absolute inset-0 z-0">
        <VideoPlayer
          key={`video-${currentIndex}`}
          videoUrl={currentQuestion.video_url}
          isMuted={isMuted}
        />
      </div>

      <Confetti trigger={triggerConfetti} />

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
                ? "radial-gradient(ellipse at center 60%, rgba(16,185,129,0.3) 0%, transparent 70%)"
                : "radial-gradient(ellipse at center 60%, rgba(220,38,38,0.25) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ FLOATING YouTube + Patreon — DESKTOP: left edge, MOBILE: tiny top pills ═══ */}
      {(currentQuestion.youtube_url || currentQuestion.patreon_url) && (
        <>
          {/* Desktop: floating pills on left edge alongside the video */}
          <div className="hidden md:flex absolute left-3 top-[38%] z-20 flex-col gap-2 pointer-events-auto">
            {currentQuestion.youtube_url && (
              <a
                href={currentQuestion.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-red-600/25 border border-red-500/25 text-red-300 hover:bg-red-600/40 transition-all text-[10px] font-medium backdrop-blur-sm"
              >
                <Play className="w-3 h-3 fill-red-400" />
                <span className="truncate max-w-[90px]">{currentQuestion.youtube_title || "Lesson"}</span>
              </a>
            )}
            {currentQuestion.patreon_url && (
              <a
                href={currentQuestion.patreon_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-orange-600/25 border border-orange-500/25 text-orange-300 hover:bg-orange-600/40 transition-all text-[10px] font-medium backdrop-blur-sm"
              >
                <svg className="w-3 h-3 fill-orange-400" viewBox="0 0 24 24">
                  <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
                </svg>
                Patreon
              </a>
            )}
          </div>
        </>
      )}

      {/* UI LAYER */}
      <div
        ref={scrollRef}
        className="absolute inset-0 z-10 overflow-y-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="min-h-full flex flex-col">

          {/* TOP BAR */}
          <div className="flex-shrink-0 pointer-events-auto">
            <div className="h-1 w-full bg-white/10">
              <motion.div
                className="h-full rounded-r-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 sm:px-5 sm:py-2">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => router.push("/")}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-black/50 backdrop-blur-xl border border-white/10"
                aria-label="Exit quiz"
              >
                <ChevronLeft className="w-4 h-4 text-white/70" />
                <span className="text-[11px] text-white/50 hidden sm:block">Exit</span>
              </motion.button>

              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-xl border border-white/10">
                <span className="text-xs sm:text-sm font-display font-700 text-white">
                  {currentIndex + 1}<span className="text-white/40 font-normal"> / {totalQuestions}</span>
                </span>
                <div className="w-px h-3.5 bg-white/20" />
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-white/40" />
                  <span className="text-[11px] sm:text-xs tabular-nums text-white/50">{formatTime(timeElapsed)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-xl border border-white/10">
                <span className="font-display font-700 text-sm sm:text-base text-amber-400">{score}</span>
                <span className="text-white/30 text-xs">/</span>
                <span className="text-white/40 text-xs">{currentIndex + (answered ? 1 : 0)}</span>
                {streak >= 2 && (
                  <motion.span
                    key={`streak-${streak}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-0.5 text-[11px] text-amber-400 font-display font-700"
                  >
                    {streak}x
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* Mobile YouTube + Patreon — tiny icon pills below top bar */}
          {(currentQuestion.youtube_url || currentQuestion.patreon_url) && (
            <div className="flex md:hidden justify-center gap-2 mt-1 flex-shrink-0 pointer-events-auto">
              {currentQuestion.youtube_url && (
                <a
                  href={currentQuestion.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-red-600/25 border border-red-500/20 flex items-center justify-center"
                  title="Watch full lesson"
                >
                  <Play className="w-3 h-3 fill-red-400 text-red-400" />
                </a>
              )}
              {currentQuestion.patreon_url && (
                <a
                  href={currentQuestion.patreon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-orange-600/25 border border-orange-500/20 flex items-center justify-center"
                  title="Support on Patreon"
                >
                  <svg className="w-3 h-3 fill-orange-400" viewBox="0 0 24 24">
                    <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* SPACER — pushes content to the BOTTOM HALF of the screen */}
          <div className="flex-shrink-0 h-[55%] sm:h-[58%]" />

          {/* ═══ BOTTOM HALF: audio + question + 4 answers ═══ */}
          <div className="flex-shrink-0 pointer-events-auto relative">
            <div className="relative z-10 w-full max-w-2xl mx-auto px-3 pb-3 sm:px-5 sm:pb-4">

              {/* AUDIO BUTTON */}
              <div className="flex justify-center mb-2">
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setIsMuted((m) => !m)}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-full border-2 transition-all duration-200 ${
                    isMuted
                      ? "bg-amber-600/25 border-amber-500/50 text-amber-200 backdrop-blur-xl"
                      : "bg-emerald-600/25 border-emerald-500/50 text-emerald-200 backdrop-blur-xl"
                  }`}
                >
                  {isMuted && (
                    <motion.span
                      className="absolute inset-0 rounded-full border-2 border-amber-400/40"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  <span className="font-display font-600 text-sm">
                    {isMuted ? "Tap to hear the clip" : "Playing"}
                  </span>
                </motion.button>
              </div>

              {/* QUESTION — prominent dark card with amber accent, visually distinct from answers */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`q-${currentIndex}`}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-2 rounded-xl bg-black/80 backdrop-blur-lg border border-amber-800/30 border-l-4 border-l-amber-500 px-4 py-3 sm:px-5 sm:py-3.5"
                >
                  <h2 className="font-display font-700 text-xl sm:text-2xl md:text-3xl text-amber-50 leading-snug text-center">
                    {currentQuestion.question_text}
                  </h2>
                </motion.div>
              </AnimatePresence>

              {/* 4 ANSWER BUTTONS */}
              <AnimatePresence mode="wait">
                {showAnswers && (
                  <motion.div
                    key={`answers-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
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

              {/* POST-ANSWER: result + Next (scrolls into view) */}
              <AnimatePresence>
                {showPostAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 space-y-2"
                  >
                    <div className={`rounded-xl p-2.5 border flex items-center gap-2.5 backdrop-blur-md ${
                      isCorrect
                        ? "bg-emerald-500/15 border-emerald-500/30"
                        : "bg-red-500/15 border-red-500/30"
                    }`}>
                      <div className={`w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                        isCorrect ? "bg-emerald-500/25 text-emerald-400" : "bg-red-500/25 text-red-400"
                      }`}>
                        {isCorrect ? "✓" : "✗"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium leading-none mb-0.5">
                          {isCorrect ? "Correct!" : "The answer was"}
                        </p>
                        <p className="text-sm font-display font-700 text-amber-400 break-words leading-tight">
                          {currentQuestion.correct_answer}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNextQuestion}
                      className="w-full py-3 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 transition-colors"
                      style={{ boxShadow: "0 0 20px rgba(180,83,9,0.3)" }}
                    >
                      {isLastQuestion ? (
                        <><CheckCircle className="w-5 h-5" /> See My Results</>
                      ) : (
                        <><ArrowRight className="w-5 h-5" /> Next Question</>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
