"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ArrowRight, RotateCcw, BookOpen, Layers, Hash, Award } from "lucide-react";
import AnswerButton from "@/components/AnswerButton";
import NotationRenderer from "@/components/NotationRenderer";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    category: "Note Reading",
    question: "What note is shown on the staff?",
    notation: "X:1\nM:4/4\nL:1\nK:C clef=treble\nE\n",
    correct: "E4",
    answers: ["E4", "F4", "D4", "G4"],
  },
  {
    id: 2,
    category: "Note Reading",
    question: "What note is shown on the staff?",
    notation: "X:1\nM:4/4\nL:1\nK:C clef=bass\nG,\n",
    correct: "G2",
    answers: ["G2", "A2", "F2", "B2"],
  },
  {
    id: 3,
    category: "Intervals",
    question: "What interval is shown?",
    notation: "X:1\nM:4/4\nL:1\nK:C\n[CE]\n",
    correct: "Major 3rd",
    answers: ["Major 3rd", "Minor 3rd", "Perfect 4th", "Perfect 5th"],
  },
  {
    id: 4,
    category: "Intervals",
    question: "What interval is shown?",
    notation: "X:1\nM:4/4\nL:1\nK:C\n[CG]\n",
    correct: "Perfect 5th",
    answers: ["Perfect 5th", "Perfect 4th", "Major 6th", "Minor 7th"],
  },
  {
    id: 5,
    category: "Chords",
    question: "What chord is this?",
    notation: "X:1\nM:4/4\nL:1\nK:C\n[CEG]\n",
    correct: "C Major",
    answers: ["C Major", "C Minor", "G Major", "F Major"],
  },
  {
    id: 6,
    category: "Chords",
    question: "What chord is this?",
    notation: "X:1\nM:4/4\nL:1\nK:C\n[C_EG]\n",
    correct: "C Minor",
    answers: ["C Minor", "C Major", "Eb Major", "G Minor"],
  },
  {
    id: 7,
    category: "Key Signatures",
    question: "What key signature has one sharp?",
    notation: "X:1\nM:4/4\nL:1\nK:G\nx\n",
    correct: "G Major",
    answers: ["G Major", "D Major", "F Major", "A Major"],
  },
  {
    id: 8,
    category: "Key Signatures",
    question: "What key signature has two flats?",
    notation: "X:1\nM:4/4\nL:1\nK:Bb\nx\n",
    correct: "Bb Major",
    answers: ["Bb Major", "Eb Major", "F Major", "Ab Major"],
  },
  {
    id: 9,
    category: "Scales",
    question: "What scale is shown?",
    notation: "X:1\nM:4/4\nL:1/4\nK:C\nCDEF|GABc|\n",
    correct: "C Major Scale",
    answers: ["C Major Scale", "C Natural Minor", "C Dorian", "C Mixolydian"],
  },
  {
    id: 10,
    category: "Chords",
    question: "What seventh chord is this?",
    notation: "X:1\nM:4/4\nL:1\nK:C\n[CEGB]\n",
    correct: "Cmaj7",
    answers: ["Cmaj7", "C7", "Cm7", "Cdim7"],
  },
];

const CATEGORIES = [
  { name: "Note Reading", icon: BookOpen, desc: "Identify individual notes on treble and bass clef", color: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/30" },
  { name: "Intervals", icon: ArrowRight, desc: "Recognize the distance between two notes", color: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/30" },
  { name: "Chords", icon: Layers, desc: "Name triads, sevenths, and extended chords", color: "from-cyan-500/20 to-blue-500/10", border: "border-cyan-500/30" },
  { name: "Key Signatures", icon: Hash, desc: "Identify keys by their sharps and flats", color: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/30" },
  { name: "Scales", icon: Music, desc: "Recognize major, minor, and modal scales", color: "from-rose-500/20 to-pink-500/10", border: "border-rose-500/30" },
  { name: "Rhythm", icon: Award, desc: "Read rhythmic patterns and time signatures", color: "from-orange-500/20 to-amber-500/10", border: "border-orange-500/30" },
];

type AnswerState = "default" | "correct" | "wrong" | "reveal";

export default function NotationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerStates, setAnswerStates] = useState<Record<string, AnswerState>>({});
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  const currentQuestion = SAMPLE_QUESTIONS[currentIndex];

  const handleAnswer = useCallback((answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);

    const isCorrect = answer === currentQuestion.correct;
    const newStates: Record<string, AnswerState> = {};

    if (isCorrect) {
      newStates[answer] = "correct";
      setScore((s) => s + 1);
    } else {
      newStates[answer] = "wrong";
      newStates[currentQuestion.correct] = "reveal";
    }

    setAnswerStates(newStates);
    setAnswered((a) => a + 1);
  }, [selectedAnswer, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex >= SAMPLE_QUESTIONS.length - 1) {
      setQuizFinished(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setAnswerStates({});
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
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
      <style jsx global>{`
        .notation-container svg {
          max-width: 100%;
          height: auto;
        }
        .notation-container svg path,
        .notation-container svg line,
        .notation-container svg polyline {
          stroke: #f5f0e8 !important;
        }
        .notation-container svg path[fill],
        .notation-container svg ellipse,
        .notation-container svg circle {
          fill: #f5f0e8 !important;
        }
        .notation-container svg text {
          fill: #f5f0e8 !important;
        }
        .notation-container svg rect.abcjs-staff-extra {
          fill: transparent !important;
        }
        .notation-container {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(245, 158, 11, 0.15);
        }
      `}</style>

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

          {!quizStarted ? (
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat, i) => {
                    const Icon = cat.icon;
                    return (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        className={`p-5 rounded-xl bg-gradient-to-br ${cat.color} border ${cat.border} backdrop-blur-sm`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="w-5 h-5 text-white/70" />
                          <h3 className="font-display font-700 text-white/90">{cat.name}</h3>
                        </div>
                        <p className="text-white/45 text-sm leading-relaxed">{cat.desc}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Start Button */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center"
              >
                <button
                  onClick={() => setQuizStarted(true)}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-display font-700 text-lg hover:from-amber-400 hover:to-orange-400 transition-all duration-300 shadow-glow-amber"
                >
                  <Music className="w-5 h-5" />
                  Start Sample Quiz
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-white/30 text-sm mt-3">10 questions across multiple categories</p>
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
                  <span className="text-white/70 font-700">{SAMPLE_QUESTIONS.length}</span>
                </p>

                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-2xl font-display font-700 text-amber-400">
                      {Math.round((score / SAMPLE_QUESTIONS.length) * 100)}%
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
          ) : (
            /* Quiz Player */
            <div className="max-w-2xl mx-auto">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/40 text-sm font-medium">
                    Question {currentIndex + 1} of {SAMPLE_QUESTIONS.length}
                  </span>
                  <span className="text-amber-400 text-sm font-display font-700">
                    Score: {score}/{answered}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
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
                  <div className="mb-6">
                    <NotationRenderer notation={currentQuestion.notation} width={350} />
                  </div>

                  {/* Question */}
                  <h2 className="font-display font-700 text-xl sm:text-2xl text-white/90 mb-5">
                    {currentQuestion.question}
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
                        {currentIndex >= SAMPLE_QUESTIONS.length - 1 ? "See Results" : "Next Question"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
