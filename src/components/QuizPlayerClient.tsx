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
      {/* ═══ VIDEO — natural 1080p, aligned to top ═══ */}
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
                ? "radial-gradient(ellipse at center 80%, rgba(16,185,129,0.3) 0%, transparent 70%)"
                : "radial-gradient(ellipse at center 80%, rgba(220,38,38,0.25) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>

      {/* ═══ UI LAYER ═══ */}
      <div
        ref={scrollRef}
        className="absolute inset-0 z-10 overflow-y-auto"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        <div className="min-h-full flex flex-col">

          {/* ─── TOP BAR ─── */}
          <div className="flex-shrink-0 pointer-events-auto">
            <div className="h-1 w-full bg-white/10">
              <motion.div
                className="h-full rounded-r-full bg-amber-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-3">
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => router.push("/")}
                className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 active:bg-black/60"
                aria-label="Exit quiz"
              >
                <ChevronLeft className="w-5 h-5 text-white/70" />
                <span className="text-xs text-white/50 hidden sm:block">Exit</span>
              </motion.button>

              <div className="flex items-center gap-2 sm:gap-3 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10">
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

              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10">
                <span className="font-display font-700 text-base sm:text-lg text-amber-400">{score}</span>
                <span className="text-white/30 text-sm">/</span>
                <span className="text-white/40 text-sm">{currentIndex + (answered ? 1 : 0)}</span>
                {streak >= 2 && (
                  <motion.span
                    key={`streak-${streak}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-1 text-xs text-amber-400 font-display font-700"
                  >
                    {streak}x
                  </motion.span>
                )}
              </div>
            </div>
          </div>

          {/* SPACER */}
          <div className="flex-1" />

          {/* ─── BOTTOM CONTENT: audio + question + answers ─── */}
          <div className="flex-shrink-0 pointer-events-auto relative">
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-4 sm:px-6 sm:pb-5">

              {/* ══ PROMINENT AUDIO BUTTON ══ */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setIsMuted((m) => !m)}
                className={`relative flex items-center gap-3 mx-auto mb-4 px-5 py-3 rounded-full backdrop-blur-xl border-2 transition-all duration-200 ${
                  isMuted
                    ? "bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30"
                    : "bg-amber-600/40 border-amber-400/60 text-white"
                }`}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {/* Pulsing ring when muted */}
                {isMuted && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-amber-500/50"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {isMuted ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
                <span className="font-display font-600 text-sm">
                  {isMuted ? "Tap to hear the clip" : "Playing audio"}
                </span>
              </motion.button>

              {/* ══ QUESTION — large, animated ══ */}
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`q-${currentIndex}`}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display font-700 text-lg sm:text-xl md:text-2xl text-white leading-snug mb-4 text-center"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.5)" }}
                >
                  {currentQuestion.question_text}
                </motion.h2>
              </AnimatePresence>

              {/* ══ ANSWER BUTTONS — compact spacing ══ */}
              <AnimatePresence mode="wait">
                {showAnswers && (
                  <motion.div
                    key={`answers-${currentIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1.5"
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

              {/* ══ POST-ANSWER: result + YouTube/Patreon + Next ══ */}
              <AnimatePresence>
                {showPostAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 space-y-2"
                  >
                    {/* Correct / Wrong banner */}
                    <div className={`rounded-xl p-3 border flex items-center gap-3 backdrop-blur-md ${
                      isCorrect
                        ? "bg-emerald-500/15 border-emerald-500/30"
                        : "bg-red-500/15 border-red-500/30"
                    }`}>
                      <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                        isCorrect ? "bg-emerald-500/25 text-emerald-400" : "bg-red-500/25 text-red-400"
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
                            You picked: <span className="text-red-400">{selectedAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* YouTube + Patreon — compact side-by-side */}
                    {(currentQuestion.youtube_url || currentQuestion.patreon_url) && (
                      <div className="flex gap-2">
                        {currentQuestion.youtube_url && (
                          <a
                            href={currentQuestion.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2.5 border border-red-500/25 bg-red-600/15 backdrop-blur-md hover:bg-red-600/25 transition-all"
                          >
                            <Play className="w-4 h-4 text-red-400 fill-red-400 flex-shrink-0" />
                            <span className="text-xs font-display font-600 text-white/80 truncate">
                              {currentQuestion.youtube_title || "Full lesson"}
                            </span>
                            <ExternalLink className="w-3 h-3 text-white/30 flex-shrink-0" />
                          </a>
                        )}
                        {currentQuestion.patreon_url && (
                          <a
                            href={currentQuestion.patreon_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 rounded-lg px-3 py-2.5 border border-orange-500/25 bg-orange-600/15 backdrop-blur-md hover:bg-orange-600/25 transition-all"
                          >
                            <svg className="w-3.5 h-3.5 text-orange-400 fill-orange-400 flex-shrink-0" viewBox="0 0 24 24">
                              <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003" />
                            </svg>
                            <span className="text-xs font-display font-600 text-white/80">Support</span>
                          </a>
                        )}
                      </div>
                    )}

                    {/* Next / Results button */}
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNextQuestion}
                      className="w-full py-3.5 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2 active:opacity-90 bg-amber-700 hover:bg-amber-600 transition-colors"
                      style={{
                        boxShadow: "0 0 20px rgba(180,83,9,0.3)",
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
    </div>
  );
}
