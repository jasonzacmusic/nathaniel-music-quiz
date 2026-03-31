"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, ArrowRight, RotateCcw, BookOpen, Layers, Hash, Award } from "lucide-react";
import AnswerButton from "@/components/AnswerButton";
import NotationRenderer from "@/components/NotationRenderer";

const SAMPLE_QUESTIONS = [
  // ═══ NOTE READING — Treble Clef ═══
  { id: 1, category: "Note Reading", question: "What note is shown on the staff?", notation: "X:1\nM:4/4\nL:1\nK:C clef=treble\nC\n", correct: "C4 (Middle C)", answers: ["C4 (Middle C)", "D4", "B3", "E4"] },
  { id: 2, category: "Note Reading", question: "What note is shown on the staff?", notation: "X:1\nM:4/4\nL:1\nK:C clef=treble\nE\n", correct: "E4", answers: ["E4", "F4", "D4", "G4"] },
  { id: 3, category: "Note Reading", question: "What note is shown on the staff?", notation: "X:1\nM:4/4\nL:1\nK:C clef=treble\nG\n", correct: "G4", answers: ["G4", "A4", "F4", "B4"] },
  { id: 4, category: "Note Reading", question: "What note is shown on the staff?", notation: "X:1\nM:4/4\nL:1\nK:C clef=treble\nB\n", correct: "B4", answers: ["B4", "A4", "C5", "D5"] },
  { id: 5, category: "Note Reading", question: "What note is shown on the staff?", notation: "X:1\nM:4/4\nL:1\nK:C clef=treble\nd\n", correct: "D5", answers: ["D5", "C5", "E5", "F5"] },
  { id: 6, category: "Note Reading", question: "What note is shown on the staff?", notation: "X:1\nM:4/4\nL:1\nK:C clef=treble\nf\n", correct: "F5", answers: ["F5", "E5", "G5", "A5"] },
  // ═══ NOTE READING — Bass Clef ═══
  { id: 7, category: "Note Reading", question: "What note is shown in bass clef?", notation: "X:1\nM:4/4\nL:1\nK:C clef=bass\nG,\n", correct: "G2", answers: ["G2", "A2", "F2", "B2"] },
  { id: 8, category: "Note Reading", question: "What note is shown in bass clef?", notation: "X:1\nM:4/4\nL:1\nK:C clef=bass\nB,\n", correct: "B2", answers: ["B2", "C3", "A2", "D3"] },
  { id: 9, category: "Note Reading", question: "What note is shown in bass clef?", notation: "X:1\nM:4/4\nL:1\nK:C clef=bass\nD\n", correct: "D3", answers: ["D3", "E3", "C3", "F3"] },
  { id: 10, category: "Note Reading", question: "What note is shown in bass clef?", notation: "X:1\nM:4/4\nL:1\nK:C clef=bass\nF\n", correct: "F3", answers: ["F3", "G3", "E3", "A3"] },
  // ═══ INTERVALS ═══
  { id: 11, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CD]\n", correct: "Major 2nd", answers: ["Major 2nd", "Minor 2nd", "Major 3rd", "Unison"] },
  { id: 12, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CE]\n", correct: "Major 3rd", answers: ["Major 3rd", "Minor 3rd", "Perfect 4th", "Major 2nd"] },
  { id: 13, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[C_E]\n", correct: "Minor 3rd", answers: ["Minor 3rd", "Major 3rd", "Major 2nd", "Perfect 4th"] },
  { id: 14, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CF]\n", correct: "Perfect 4th", answers: ["Perfect 4th", "Perfect 5th", "Major 3rd", "Tritone"] },
  { id: 15, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CG]\n", correct: "Perfect 5th", answers: ["Perfect 5th", "Perfect 4th", "Major 6th", "Minor 7th"] },
  { id: 16, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[C^F]\n", correct: "Tritone", answers: ["Tritone", "Perfect 5th", "Perfect 4th", "Minor 6th"] },
  { id: 17, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CA]\n", correct: "Major 6th", answers: ["Major 6th", "Minor 6th", "Perfect 5th", "Minor 7th"] },
  { id: 18, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CB]\n", correct: "Major 7th", answers: ["Major 7th", "Minor 7th", "Octave", "Major 6th"] },
  { id: 19, category: "Intervals", question: "What interval is shown?", notation: "X:1\nM:4/4\nL:1\nK:C\n[Cc]\n", correct: "Octave", answers: ["Octave", "Major 7th", "Minor 7th", "Major 9th"] },
  // ═══ CHORDS — Triads ═══
  { id: 20, category: "Chords", question: "What chord is this?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CEG]\n", correct: "C Major", answers: ["C Major", "C Minor", "C Augmented", "C Diminished"] },
  { id: 21, category: "Chords", question: "What chord is this?", notation: "X:1\nM:4/4\nL:1\nK:C\n[C_EG]\n", correct: "C Minor", answers: ["C Minor", "C Major", "Eb Major", "C Diminished"] },
  { id: 22, category: "Chords", question: "What chord is this?", notation: "X:1\nM:4/4\nL:1\nK:C\n[C_E_G]\n", correct: "C Diminished", answers: ["C Diminished", "C Minor", "C Major", "C Augmented"] },
  { id: 23, category: "Chords", question: "What chord is this?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CE^G]\n", correct: "C Augmented", answers: ["C Augmented", "C Major", "C Minor", "C Diminished"] },
  { id: 24, category: "Chords", question: "What chord is this?", notation: "X:1\nM:4/4\nL:1\nK:G\n[GBd]\n", correct: "G Major", answers: ["G Major", "G Minor", "D Major", "E Minor"] },
  { id: 25, category: "Chords", question: "What chord is this?", notation: "X:1\nM:4/4\nL:1\nK:F\n[FAc]\n", correct: "F Major", answers: ["F Major", "F Minor", "C Major", "Bb Major"] },
  // ═══ CHORDS — Sevenths ═══
  { id: 26, category: "Chords", question: "What seventh chord is this?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CEGB]\n", correct: "Cmaj7", answers: ["Cmaj7", "C7", "Cm7", "Cdim7"] },
  { id: 27, category: "Chords", question: "What seventh chord is this?", notation: "X:1\nM:4/4\nL:1\nK:C\n[CEG_B]\n", correct: "C7 (Dominant)", answers: ["C7 (Dominant)", "Cmaj7", "Cm7", "Cdim7"] },
  { id: 28, category: "Chords", question: "What seventh chord is this?", notation: "X:1\nM:4/4\nL:1\nK:C\n[C_EG_B]\n", correct: "Cm7", answers: ["Cm7", "C7", "Cmaj7", "Cm(maj7)"] },
  { id: 29, category: "Chords", question: "What seventh chord is this?", notation: "X:1\nM:4/4\nL:1\nK:C\n[C_E_G_B]\n", correct: "Cm7b5 (Half-dim)", answers: ["Cm7b5 (Half-dim)", "Cdim7", "Cm7", "C7"] },
  // ═══ KEY SIGNATURES ═══
  { id: 30, category: "Key Signatures", question: "What key has no sharps or flats?", notation: "X:1\nM:4/4\nL:1\nK:C\nx\n", correct: "C Major / A Minor", answers: ["C Major / A Minor", "G Major", "F Major", "D Major"] },
  { id: 31, category: "Key Signatures", question: "What key has one sharp (F#)?", notation: "X:1\nM:4/4\nL:1\nK:G\nx\n", correct: "G Major / E Minor", answers: ["G Major / E Minor", "D Major", "A Major", "F Major"] },
  { id: 32, category: "Key Signatures", question: "What key has two sharps (F#, C#)?", notation: "X:1\nM:4/4\nL:1\nK:D\nx\n", correct: "D Major / B Minor", answers: ["D Major / B Minor", "A Major", "G Major", "E Major"] },
  { id: 33, category: "Key Signatures", question: "What key has three sharps?", notation: "X:1\nM:4/4\nL:1\nK:A\nx\n", correct: "A Major / F# Minor", answers: ["A Major / F# Minor", "E Major", "D Major", "B Major"] },
  { id: 34, category: "Key Signatures", question: "What key has one flat (Bb)?", notation: "X:1\nM:4/4\nL:1\nK:F\nx\n", correct: "F Major / D Minor", answers: ["F Major / D Minor", "Bb Major", "C Major", "G Major"] },
  { id: 35, category: "Key Signatures", question: "What key has two flats (Bb, Eb)?", notation: "X:1\nM:4/4\nL:1\nK:Bb\nx\n", correct: "Bb Major / G Minor", answers: ["Bb Major / G Minor", "Eb Major", "F Major", "Ab Major"] },
  { id: 36, category: "Key Signatures", question: "What key has three flats?", notation: "X:1\nM:4/4\nL:1\nK:Eb\nx\n", correct: "Eb Major / C Minor", answers: ["Eb Major / C Minor", "Bb Major", "Ab Major", "F Minor"] },
  { id: 37, category: "Key Signatures", question: "What key has four sharps?", notation: "X:1\nM:4/4\nL:1\nK:E\nx\n", correct: "E Major / C# Minor", answers: ["E Major / C# Minor", "A Major", "B Major", "F# Major"] },
  // ═══ SCALES ═══
  { id: 38, category: "Scales", question: "What scale is shown?", notation: "X:1\nM:4/4\nL:1/4\nK:C\nCDEF|GABc|\n", correct: "C Major", answers: ["C Major", "C Natural Minor", "C Dorian", "C Mixolydian"] },
  { id: 39, category: "Scales", question: "What scale is shown?", notation: "X:1\nM:4/4\nL:1/4\nK:C\nCD_EF|G_A_Bc|\n", correct: "C Natural Minor", answers: ["C Natural Minor", "C Major", "C Harmonic Minor", "C Dorian"] },
  { id: 40, category: "Scales", question: "What scale is shown?", notation: "X:1\nM:4/4\nL:1/4\nK:C\nCD_EF|G_ABc|\n", correct: "C Harmonic Minor", answers: ["C Harmonic Minor", "C Natural Minor", "C Melodic Minor", "C Phrygian"] },
  { id: 41, category: "Scales", question: "What scale is shown?", notation: "X:1\nM:4/4\nL:1/4\nK:G\nGABc|defg|\n", correct: "G Major", answers: ["G Major", "G Mixolydian", "G Dorian", "D Major"] },
  { id: 42, category: "Scales", question: "What scale is shown?", notation: "X:1\nM:4/4\nL:1/4\nK:C\nCD_EF|GABc|\n", correct: "C Dorian", answers: ["C Dorian", "C Natural Minor", "C Mixolydian", "C Major"] },
  { id: 43, category: "Scales", question: "What scale is shown?", notation: "X:1\nM:4/4\nL:1/4\nK:C\nCDEF|GA_Bc|\n", correct: "C Mixolydian", answers: ["C Mixolydian", "C Major", "C Dorian", "C Lydian"] },
  // ═══ RHYTHM ═══
  { id: 44, category: "Rhythm", question: "What time signature is shown?", notation: "X:1\nM:4/4\nL:1/4\nK:C\nCDEF|\n", correct: "4/4", answers: ["4/4", "3/4", "6/8", "2/4"] },
  { id: 45, category: "Rhythm", question: "What time signature is shown?", notation: "X:1\nM:3/4\nL:1/4\nK:C\nCDE|\n", correct: "3/4", answers: ["3/4", "4/4", "6/8", "2/4"] },
  { id: 46, category: "Rhythm", question: "What time signature is shown?", notation: "X:1\nM:6/8\nL:1/8\nK:C\nCDE FGA|\n", correct: "6/8", answers: ["6/8", "3/4", "4/4", "9/8"] },
  { id: 47, category: "Rhythm", question: "What note value is a filled note head with a stem?", notation: "X:1\nM:4/4\nL:1/4\nK:C\nC\n", correct: "Quarter Note", answers: ["Quarter Note", "Half Note", "Whole Note", "Eighth Note"] },
  { id: 48, category: "Rhythm", question: "How many beats does a half note get in 4/4?", notation: "X:1\nM:4/4\nL:1/2\nK:C\nC\n", correct: "2 beats", answers: ["2 beats", "1 beat", "4 beats", "3 beats"] },
  { id: 49, category: "Rhythm", question: "What time signature is shown?", notation: "X:1\nM:2/4\nL:1/4\nK:C\nCD|\n", correct: "2/4", answers: ["2/4", "4/4", "3/4", "6/8"] },
  { id: 50, category: "Rhythm", question: "What time signature is shown?", notation: "X:1\nM:5/4\nL:1/4\nK:C\nCDEFG|\n", correct: "5/4", answers: ["5/4", "4/4", "3/4", "7/8"] },
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter questions by category if one is selected
  const filteredQuestions = activeCategory
    ? SAMPLE_QUESTIONS.filter((q) => q.category === activeCategory)
    : SAMPLE_QUESTIONS;
  const currentQuestion = filteredQuestions[currentIndex];

  // Count per category
  const categoryCounts: Record<string, number> = {};
  SAMPLE_QUESTIONS.forEach((q) => {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  });

  const startQuiz = useCallback((category?: string) => {
    setActiveCategory(category || null);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerStates({});
    setScore(0);
    setAnswered(0);
    setQuizStarted(true);
    setQuizFinished(false);
  }, []);

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
    if (currentIndex >= filteredQuestions.length - 1) {
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
    setActiveCategory(null);
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
                {/* All Questions button */}
                <motion.button
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startQuiz()}
                  className="w-full mb-6 p-5 rounded-xl bg-gradient-to-r from-amber-600/30 to-orange-600/20 border-2 border-amber-500/40 hover:border-amber-400/60 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-700 text-lg text-white mb-1">All Categories</h3>
                      <p className="text-white/50 text-sm">{filteredQuestions.length} questions across all topics</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                      <ArrowRight className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                </motion.button>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat, i) => {
                    const Icon = cat.icon;
                    const count = categoryCounts[cat.name] || 0;
                    return (
                      <motion.button
                        key={cat.name}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => startQuiz(cat.name)}
                        className={`p-5 rounded-xl bg-gradient-to-br ${cat.color} border ${cat.border} backdrop-blur-sm text-left hover:shadow-lg transition-all group`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                            <h3 className="font-display font-700 text-white/90">{cat.name}</h3>
                          </div>
                          <span className="text-xs text-white/30 font-display">{count}q</span>
                        </div>
                        <p className="text-white/45 text-sm leading-relaxed">{cat.desc}</p>
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
                  <span className="text-white/70 font-700">{filteredQuestions.length}</span>
                </p>

                <div className="flex items-center justify-center gap-3 mb-8">
                  <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="text-2xl font-display font-700 text-amber-400">
                      {Math.round((score / filteredQuestions.length) * 100)}%
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
                    Question {currentIndex + 1} of {filteredQuestions.length}
                  </span>
                  <span className="text-amber-400 text-sm font-display font-700">
                    Score: {score}/{answered}
                  </span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%` }}
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
                  <div className="mb-6 flex justify-center">
                    <div className="inline-block rounded-xl overflow-hidden shadow-lg">
                      <NotationRenderer notation={currentQuestion.notation} width={320} />
                    </div>
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
                        {currentIndex >= filteredQuestions.length - 1 ? "See Results" : "Next Question"}
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
