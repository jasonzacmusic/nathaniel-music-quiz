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
import QuestionOverlay from "./QuestionOverlay";
import ScoreDisplay from "./ScoreDisplay";
import YouTubeCard from "./YouTubeCard";
import Confetti from "./Confetti";

interface QuizPlayerClientProps {
  questions: QuestionWithShuffledAnswers[];
  setId: string;
}

export default function QuizPlayerClient({
  questions,
  setId,
}: QuizPlayerClientProps) {
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
    isComplete,
    handleAnswer,
    nextQuestion,
  } = useQuiz({ questions });

  const { height, blur } = useOverlay(setId);
  const [showYouTube, setShowYouTube] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  // Show YouTube card and confetti after answer
  useEffect(() => {
    if (answered && isCorrect) {
      setTriggerConfetti(true);
      const timer = setTimeout(() => {
        setShowYouTube(true);
      }, 800);
      return () => clearTimeout(timer);
    } else if (answered && !isCorrect) {
      setShowYouTube(true);
    }
  }, [answered, isCorrect]);

  // Reset YouTube card when moving to next question
  useEffect(() => {
    if (!answered) {
      setShowYouTube(false);
      setTriggerConfetti(false);
    }
  }, [currentIndex, answered]);

  const handleExit = () => {
    router.push("/");
  };

  const handleNextQuestion = () => {
    if (isComplete) {
      // Prepare result data
      const resultData = {
        score,
        total: totalQuestions,
        timeElapsed,
        setId,
      };
      // Store in sessionStorage for results page
      sessionStorage.setItem("quizResults", JSON.stringify(resultData));
      router.push("/results");
    } else {
      nextQuestion();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pt-4 pb-8">
      {/* Confetti Trigger */}
      <Confetti trigger={triggerConfetti} />

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: (currentIndex + (answered ? 1 : 0)) / totalQuestions }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="h-1 bg-gradient-to-r from-electric-violet to-warm-amber origin-left"
        style={{ transformOrigin: "left" }}
      />

      {/* Header Bar */}
      <div className="px-4 md:px-8 py-4 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          {/* Exit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExit}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Exit quiz"
          >
            <ChevronLeft className="w-6 h-6 text-slate-400 hover:text-white transition-colors" />
          </motion.button>

          {/* Progress Indicator */}
          <div className="flex-1 text-center">
            <p className="text-sm text-slate-400">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>

          {/* Score Display */}
          <ScoreDisplay correct={score} total={totalQuestions} streak={streak} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
        <div className="w-full max-w-3xl">
          {/* Timer */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-6 text-slate-400"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{formatTime(timeElapsed)}</span>
          </motion.div>

          {/* Video Container */}
          <motion.div
            key={`video-${currentIndex}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-full max-w-2xl mx-auto mb-8"
          >
            <VideoPlayer
              videoUrl={currentQuestion.video_url}
              className="rounded-3xl shadow-2xl"
            />

            {/* Question Overlay */}
            <QuestionOverlay
              question={currentQuestion.question_text}
              answers={currentQuestion.answers}
              onAnswer={handleAnswer}
              answered={answered}
              correctAnswer={currentQuestion.correct_answer}
              overlaySettings={{ height, blur }}
            />
          </motion.div>

          {/* Unmute Reminder */}
          {!answered && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className="text-center text-xs text-slate-500 mb-6"
            >
              Unmute video to hear the answer options
            </motion.p>
          )}

          {/* YouTube Card and Next Button Container */}
          <AnimatePresence mode="wait">
            {answered && (
              <motion.div
                key={`answer-section-${currentIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* YouTube Card */}
                {showYouTube && currentQuestion.youtube_url && (
                  <YouTubeCard
                    title={currentQuestion.youtube_title}
                    url={currentQuestion.youtube_url}
                  />
                )}

                {/* Explanation Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10"
                >
                  <p className="text-sm text-slate-400 mb-2">Correct answer:</p>
                  <p className="text-base md:text-lg font-display font-700 text-warm-amber">
                    {currentQuestion.correct_answer}
                  </p>
                  {isCorrect === false && selectedAnswer !== currentQuestion.correct_answer && (
                    <p className="text-sm text-slate-400 mt-3">
                      You selected:{" "}
                      <span className="text-rose font-medium">{selectedAnswer}</span>
                    </p>
                  )}
                </motion.div>

                {/* Next Question / Results Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextQuestion}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-electric-violet to-deep-purple text-white font-display font-700 text-lg hover:shadow-glow-purple transition-all"
                >
                  {isLastQuestion ? "See Results" : "Next Question"}
                </motion.button>

                {/* Statistics Preview */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-3 md:gap-4"
                >
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                    <p className="text-xs text-slate-500 mb-1">Streak</p>
                    <p className="text-lg font-display font-700 text-warm-amber">
                      {streak > 0 ? `${streak} 🔥` : "-"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-center">
                    <p className="text-xs text-slate-500 mb-1">Accuracy</p>
                    <p className="text-lg font-display font-700 text-electric-violet">
                      {totalQuestions > 0
                        ? Math.round((score / totalQuestions) * 100)
                        : 0}
                      %
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
