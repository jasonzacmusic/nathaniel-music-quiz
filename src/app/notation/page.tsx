"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ArrowRight, RotateCcw, BookOpen, Layers, Hash, Award, Loader2 } from "lucide-react";
import AnswerButton from "@/components/AnswerButton";
import NotationRenderer from "@/components/NotationRenderer";

interface NotationQuestion {
  id: number;
  question_text: string;
  correct_answer: string;
  notation_data: string | null;
  category: string;
  difficulty: string;
  answers: string[];
}

interface CategoryInfo {
  category: string;
  count: number;
}

const CATEGORY_STYLES: Record<string, { icon: typeof BookOpen; desc: string; color: string; border: string }> = {
  "Note Reading": { icon: BookOpen, desc: "Identify individual notes on treble and bass clef", color: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/30" },
  "Intervals": { icon: ArrowRight, desc: "Recognize the distance between two notes", color: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/30" },
  "Chords": { icon: Layers, desc: "Name triads, sevenths, and extended chords", color: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/30" },
  "Key Signatures": { icon: Hash, desc: "Identify keys by their sharps and flats", color: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/30" },
  "Scales": { icon: Music, desc: "Recognize major, minor, and modal scales", color: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/30" },
  "Rhythm": { icon: Award, desc: "Read rhythmic patterns and time signatures", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/30" },
};

const DEFAULT_STYLE = { icon: Music, desc: "Staff notation questions", color: "from-white/10 to-white/5", border: "border-white/20" };

type AnswerState = "default" | "correct" | "wrong" | "reveal";

export default function NotationPage() {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [questions, setQuestions] = useState<NotationQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>({});
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = questions[currentIndex];

  // Fetch categories and stats on mount
  useEffect(() => {
    fetch("/api/notation?stats=true")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setTotalQuestions(data.stats?.total_questions || 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load notation data. Please try again.");
        setLoading(false);
      });
  }, []);

  const startQuiz = useCallback(async (category?: string) => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerStates({});
    setScore(0);
    setAnswered(0);
    setQuizFinished(false);
    setLoadingQuestions(true);

    try {
      const params = new URLSearchParams({ count: "20" });
      if (category) params.set("category", category);
      const res = await fetch(`/api/notation?${params}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions || []);
      setQuizStarted(true);
    } catch {
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer || !currentQuestion) return;
    setSelectedAnswer(answer);

    const isCorrect = answer === currentQuestion.correct_answer;
    const newStates: Record<string, AnswerState> = {};

    if (isCorrect) {
      newStates[answer] = "correct";
      setScore((s) => s + 1);
    } else {
      newStates[answer] = "wrong";
      newStates[currentQuestion.correct_answer] = "reveal";
    }

    setAnswerStates(newStates);
    setAnswered((a) => a + 1);
  }, [selectedAnswer, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex >= questions.length - 1) {
      setQuizFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setAnswerStates({});
  }, [currentIndex, questions.length]);

  const handleRestart = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerStates({});
    setScore(0);
    setAnswered(0);
    setQuizFinished(false);
    setQuizStarted(false);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#0a0a08] text-white">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Music className="w-4 h-4 text-amber-400" />
              <span className="text-amber-300 text-sm font-medium">Staff Notation</span>
            </div>
            <h1 className="font-display font-700 text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-4">
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Staff Notation
              </span>
            </h1>
            <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Read the staff. Name what you see. Professional notation rendered in your browser.
            </p>
          </motion.div>

          {/* Error state */}
          {error && (
            <div className="max-w-lg mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => { setError(null); window.location.reload(); }}
                className="mt-2 text-xs text-white/50 underline hover:text-white/70"
              >
                Reload page
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          )}

          {!loading && !error && !quizStarted ? (
            <>
              {/* Category Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="font-display font-700 text-xl text-white/80 mb-6 text-center">
                  Question Categories
                </h2>
                {/* All Questions button */}
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startQuiz()}
                  disabled={loadingQuestions}
                  className="w-full mb-6 p-5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/20 border-2 border-amber-500/40 hover:border-amber-400/60 transition-all text-left group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-700 text-lg text-white mb-1">All Categories</h3>
                      <p className="text-white/50 text-sm">{totalQuestions} questions across all topics</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                      {loadingQuestions ? (
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      ) : (
                        <ArrowRight className="w-5 h-5 text-amber-400" />
                      )}
                    </div>
                  </div>
                </motion.button>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat, i) => {
                    const style = CATEGORY_STYLES[cat.category] || DEFAULT_STYLE;
                    const Icon = style.icon;
                    return (
                      <motion.button
                        key={cat.category}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => startQuiz(cat.category)}
                        disabled={loadingQuestions}
                        className={`p-5 rounded-xl bg-gradient-to-br ${style.color} border ${style.border} backdrop-blur-sm text-left hover:shadow-lg transition-all group disabled:opacity-50`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                            <h3 className="font-display font-700 text-white/90">{cat.category}</h3>
                          </div>
                          <span className="text-xs text-white/30 font-display">{cat.count}q</span>
                        </div>
                        <p className="text-white/45 text-sm leading-relaxed">{style.desc}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          ) : quizFinished ? (
            /* Results */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-lg mx-auto text-center"
            >
              <div className="p-8 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
                <div className="text-6xl mb-4">
                  {score >= 9 ? "🏆" : score >= 7 ? "🌟" : score >= 5 ? "👏" : "📚"}
                </div>
                <h2 className="font-display font-700 text-3xl mb-2">
                  {score >= 9 ? "Outstanding!" : score >= 7 ? "Great Work!" : score >= 5 ? "Good Effort!" : "Keep Practicing!"}
                </h2>
                <p className="text-white/50 mb-6">
                  You scored <span className="text-amber-400 font-700">{score}</span> out of{" "}
                  <span className="text-white/70 font-700">{questions.length}</span>
                </p>

                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-2xl font-display font-700 text-amber-400">
                      {Math.round((score / questions.length) * 100)}%
                    </div>
                    <div className="text-xs text-white/40">Accuracy</div>
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                    <div className="text-2xl font-display font-700 text-violet-400">{answered}</div>
                    <div className="text-xs text-white/40">Answered</div>
                  </div>
                </div>

                <button
                  onClick={handleRestart}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-display font-700 hover:from-amber-400 hover:to-orange-400 transition-all duration-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            </motion.div>
          ) : quizStarted && currentQuestion ? (
            /* Quiz Player */
            <div className="max-w-2xl mx-auto">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-sm font-medium">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-amber-400 text-sm font-display font-700">
                    Score: {score}/{answered}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Category badge */}
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs font-medium">
                      {currentQuestion.category}
                    </span>
                  </div>

                  {/* Notation display */}
                  {currentQuestion.notation_data && (
                    <div className="mb-6 flex justify-center">
                      <NotationRenderer notation={currentQuestion.notation_data} width={320} />
                    </div>
                  )}

                  {/* Question */}
                  <h2 className="font-display font-700 text-xl sm:text-2xl text-white/90 mb-5">
                    {currentQuestion.question_text}
                  </h2>

                  {/* Answer buttons */}
                  <div className="space-y-2.5 mb-6">
                    {currentQuestion.answers.map((answer, i) => (
                      <AnswerButton
                        key={answer}
                        text={answer}
                        index={i}
                        state={answerStates[answer] || "default"}
                        disabled={!!selectedAnswer}
                        onClick={() => handleAnswer(answer)}
                      />
                    ))}
                  </div>

                  {/* Next button */}
                  {selectedAnswer && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-center"
                    >
                      <button
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/15 text-white font-display font-700 hover:bg-white/15 transition-all duration-200"
                      >
                        {currentIndex >= questions.length - 1 ? "See Results" : "Next Question"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
