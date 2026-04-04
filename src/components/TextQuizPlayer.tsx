"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Clock, ArrowRight, CheckCircle, BookOpen } from "lucide-react";
import { QuestionWithShuffledAnswers } from "@/lib/queries";
import { useQuiz } from "@/hooks/useQuiz";
import { formatTime } from "@/lib/utils";
import AnswerButton from "./AnswerButton";
import Confetti from "./Confetti";
import NotationRenderer from "./NotationRenderer";

interface TextQuizPlayerProps {
  questions: QuestionWithShuffledAnswers[];
  title?: string;
  difficulty?: string;
  quizCategory?: string;
  pathId?: string;
  stepIndex?: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function TextQuizPlayer({ questions, title, difficulty, quizCategory, pathId, stepIndex }: TextQuizPlayerProps) {
  const router = useRouter();
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    streak,
    bestStreak,
    answered,
    selectedAnswer,
    isCorrect,
    timeElapsed,
    questionTimes,
    questionResults,
    handleAnswer,
    nextQuestion,
  } = useQuiz({ questions });

  const [showPostAnswer, setShowPostAnswer] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowAnswers(true), 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (answered) {
      if (isCorrect) {
        setTriggerConfetti(true);
        setTimeout(() => setShowPostAnswer(true), 500);
      } else {
        setTimeout(() => setShowPostAnswer(true), 300);
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

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const progress = (currentIndex + (answered ? 1 : 0)) / totalQuestions;

  const handleNextQuestion = useCallback(() => {
    if (isLastQuestion && answered) {
      const resultData = {
        score, total: totalQuestions, timeElapsed, setId: title || "theory", bestStreak, questionTimes,
        questionResults, difficulty: difficulty || null, quizCategory: quizCategory || null,
        pathId: pathId || null, stepIndex: stepIndex ?? null,
      };
      sessionStorage.setItem("quizResults", JSON.stringify(resultData));
      router.push("/results");
    } else {
      nextQuestion();
    }
  }, [isLastQuestion, answered, score, totalQuestions, timeElapsed, title, bestStreak, questionTimes, router, nextQuestion]);

  // Keyboard shortcuts: 1-4 to select answers, Enter/Space for next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      if (!currentQuestion) return;

      if (!answered && showAnswers) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= currentQuestion.answers.length) {
          e.preventDefault();
          handleAnswer(currentQuestion.answers[num - 1]);
        }
      }

      if (answered && showPostAnswer && (e.key === "Enter" || e.code === "Space")) {
        e.preventDefault();
        handleNextQuestion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentQuestion, answered, showAnswers, showPostAnswer, handleAnswer, handleNextQuestion]);

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
          <p className="text-stone-500 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a08] relative">
      <Confetti trigger={triggerConfetti} />

      {/* Warm background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_20%,rgba(180,83,9,0.08),transparent)]" />
      </div>

      {/* TOP BAR */}
      <div className="sticky top-0 z-20 bg-[#0a0a08]/90 backdrop-blur-xl border-b border-amber-900/15">
        <div className="h-1 w-full bg-white/5">
          <motion.div
            className="h-full rounded-r-full bg-amber-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-2 sm:px-6">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => router.push("/theory")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[11px] hidden sm:block">Back</span>
          </motion.button>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-display font-700 text-white">
              {currentIndex + 1}<span className="text-white/40 font-normal"> / {totalQuestions}</span>
            </span>
            <div className="w-px h-3.5 bg-white/15" />
            <Clock className="w-3 h-3 text-white/30" />
            <span className="text-[11px] tabular-nums text-white/40">{formatTime(timeElapsed)}</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="font-display font-700 text-amber-400">{score}</span>
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

      {/* MAIN CONTENT */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Title + badges */}
        {title && (
          <p className="text-center text-[11px] text-stone-600 uppercase tracking-[0.15em] font-medium mb-6">
            {title}
          </p>
        )}

        {/* Difficulty + Category badges */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {currentQuestion.difficulty && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-600 uppercase tracking-wider border ${DIFFICULTY_COLORS[currentQuestion.difficulty] || DIFFICULTY_COLORS.beginner}`}>
              {currentQuestion.difficulty}
            </span>
          )}
          {currentQuestion.category && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-600 uppercase tracking-wider bg-white/[0.04] text-stone-400 border border-white/10">
              {currentQuestion.category}
            </span>
          )}
        </div>

        {/* QUESTION CARD — large, prominent */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 rounded-2xl bg-gradient-to-b from-amber-950/15 to-transparent border border-amber-800/20 px-6 py-6 sm:px-8 sm:py-8"
          >
            <div className="flex items-start gap-3 mb-3">
              <BookOpen className="w-5 h-5 text-amber-600/60 flex-shrink-0 mt-1" />
              <p className="text-[10px] text-amber-600/60 uppercase tracking-[0.15em] font-medium">Question {currentIndex + 1}</p>
            </div>
            {currentQuestion.notation_data && (
              <div className="mb-4 flex justify-center">
                <NotationRenderer notation={currentQuestion.notation_data} width={320} />
              </div>
            )}
            <h2 className="font-display font-700 text-2xl sm:text-3xl md:text-4xl text-amber-50 leading-snug">
              {currentQuestion.question_text}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* ANSWER BUTTONS */}
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

        {/* POST-ANSWER */}
        <AnimatePresence>
          {showPostAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-5 space-y-3"
            >
              {/* Result banner */}
              <div className={`rounded-xl p-4 border flex items-start gap-3 ${
                isCorrect
                  ? "bg-emerald-500/10 border-emerald-500/25"
                  : "bg-red-500/10 border-red-500/25"
              }`}>
                <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${
                  isCorrect ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {isCorrect ? "✓" : "✗"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-white/50 uppercase tracking-wider font-medium mb-0.5">
                    {isCorrect ? "Correct!" : "The answer was"}
                  </p>
                  <p className="text-base font-display font-700 text-amber-400">
                    {currentQuestion.correct_answer}
                  </p>
                  {!isCorrect && selectedAnswer && selectedAnswer !== currentQuestion.correct_answer && (
                    <p className="text-xs text-white/40 mt-1">
                      You picked: <span className="text-red-400">{selectedAnswer}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Explanation */}
              {currentQuestion.explanation && (
                <div className="rounded-xl p-4 border border-amber-800/20 bg-amber-950/10">
                  <p className="text-[10px] text-amber-600/60 uppercase tracking-wider font-medium mb-1.5">Explanation</p>
                  <p className="text-sm text-stone-300 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              )}

              {/* Improvement note — shown on wrong answers */}
              {!isCorrect && currentQuestion.improvement_note && (
                <div className="rounded-xl p-4 border border-violet-800/20 bg-violet-950/10">
                  <p className="text-[10px] text-violet-400/60 uppercase tracking-wider font-medium mb-1.5">Study Tip</p>
                  <p className="text-sm text-stone-300 leading-relaxed">{currentQuestion.improvement_note}</p>
                </div>
              )}

              {/* YouTube link */}
              {currentQuestion.youtube_url && (
                <a
                  href={currentQuestion.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-xl p-3 border border-red-500/20 bg-red-600/10 hover:bg-red-600/20 transition-all text-sm"
                >
                  <span className="text-red-400 font-display font-600">Watch the lesson</span>
                  <span className="text-stone-500 truncate flex-1">{currentQuestion.youtube_title || ""}</span>
                </a>
              )}

              {/* Next button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-xl font-display font-700 text-base text-white flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 transition-colors"
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
  );
}
