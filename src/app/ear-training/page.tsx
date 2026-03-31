"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2,
  Play,
  RefreshCw,
  Music,
  Headphones,
  ArrowLeft,
  Trophy,
  Flame,
  Check,
  X,
  Loader2,
  Ear,
  Layers,
  BarChart3,
  Zap,
  Timer,
  GitBranch,
} from "lucide-react";
import Link from "next/link";
import { usePiano } from "@/components/PianoPlayer";
import RhythmTrainer from "@/components/RhythmTrainer";
import VolumeControl from "@/components/VolumeControl";

/* ---------- Music theory data ---------- */

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function midiToNote(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return NOTES[noteIndex] + octave;
}

const INTERVALS = [
  { name: "Minor 2nd", semitones: 1 },
  { name: "Major 2nd", semitones: 2 },
  { name: "Minor 3rd", semitones: 3 },
  { name: "Major 3rd", semitones: 4 },
  { name: "Perfect 4th", semitones: 5 },
  { name: "Tritone", semitones: 6 },
  { name: "Perfect 5th", semitones: 7 },
  { name: "Minor 6th", semitones: 8 },
  { name: "Major 6th", semitones: 9 },
  { name: "Minor 7th", semitones: 10 },
  { name: "Major 7th", semitones: 11 },
  { name: "Octave", semitones: 12 },
];

const TRIADS = [
  { name: "Major", intervals: [0, 4, 7] },
  { name: "Minor", intervals: [0, 3, 7] },
  { name: "Diminished", intervals: [0, 3, 6] },
  { name: "Augmented", intervals: [0, 4, 8] },
];

const SEVENTH_CHORDS = [
  { name: "Major 7th", intervals: [0, 4, 7, 11] },
  { name: "Minor 7th", intervals: [0, 3, 7, 10] },
  { name: "Dominant 7th", intervals: [0, 4, 7, 10] },
  { name: "Diminished 7th", intervals: [0, 3, 6, 9] },
  { name: "Half-Dim 7th", intervals: [0, 3, 6, 10] },
  { name: "Min-Maj 7th", intervals: [0, 3, 7, 11] },
];

const SCALES = [
  { name: "Major", intervals: [0, 2, 4, 5, 7, 9, 11, 12] },
  { name: "Natural Minor", intervals: [0, 2, 3, 5, 7, 8, 10, 12] },
  { name: "Harmonic Minor", intervals: [0, 2, 3, 5, 7, 8, 11, 12] },
  { name: "Melodic Minor", intervals: [0, 2, 3, 5, 7, 9, 11, 12] },
  { name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10, 12] },
  { name: "Mixolydian", intervals: [0, 2, 4, 5, 7, 9, 10, 12] },
];

const PROGRESSIONS = [
  { name: "I - IV - V - I", chords: [[0,4,7], [5,9,12], [7,11,14], [0,4,7]] },
  { name: "I - V - vi - IV", chords: [[0,4,7], [7,11,14], [9,12,16], [5,9,12]] },
  { name: "ii - V - I", chords: [[2,5,9], [7,11,14], [0,4,7], [0,4,7]] },
  { name: "I - vi - IV - V", chords: [[0,4,7], [9,12,16], [5,9,12], [7,11,14]] },
  { name: "I - IV - vi - V", chords: [[0,4,7], [5,9,12], [9,12,16], [7,11,14]] },
  { name: "vi - IV - I - V", chords: [[9,12,16], [5,9,12], [0,4,7], [7,11,14]] },
];

type ExerciseType = "intervals" | "triads" | "seventh-chords" | "scales" | "single-notes" | "rhythm" | "progressions";

interface Question {
  type: ExerciseType;
  correctAnswer: string;
  options: string[];
  rootMidi: number;
  notesToPlay: string[];
}

/* ---------- Question generation ---------- */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateQuestion(type: ExerciseType): Question {
  // Root note in a comfortable piano range (C3=48 to C5=72)
  const rootMidi = 48 + Math.floor(Math.random() * 24);

  switch (type) {
    case "single-notes": {
      const noteIndex = Math.floor(Math.random() * 12);
      const midi = 48 + noteIndex + Math.floor(Math.random() * 2) * 12;
      const correctAnswer = NOTES[noteIndex];
      const otherNotes = NOTES.filter((n) => n !== correctAnswer);
      const distractors = shuffle(otherNotes).slice(0, 3);
      return {
        type,
        correctAnswer,
        options: shuffle([correctAnswer, ...distractors]),
        rootMidi: midi,
        notesToPlay: [midiToNote(midi)],
      };
    }
    case "intervals": {
      const interval = pickRandom(INTERVALS);
      const others = INTERVALS.filter((i) => i.name !== interval.name);
      const distractors = shuffle(others)
        .slice(0, 3)
        .map((i) => i.name);
      return {
        type,
        correctAnswer: interval.name,
        options: shuffle([interval.name, ...distractors]),
        rootMidi,
        notesToPlay: [midiToNote(rootMidi), midiToNote(rootMidi + interval.semitones)],
      };
    }
    case "triads": {
      const triad = pickRandom(TRIADS);
      const others = TRIADS.filter((t) => t.name !== triad.name);
      const distractors = others.map((t) => t.name);
      return {
        type,
        correctAnswer: triad.name,
        options: shuffle([triad.name, ...distractors]),
        rootMidi,
        notesToPlay: triad.intervals.map((i) => midiToNote(rootMidi + i)),
      };
    }
    case "seventh-chords": {
      const chord = pickRandom(SEVENTH_CHORDS);
      const others = SEVENTH_CHORDS.filter((c) => c.name !== chord.name);
      const distractors = shuffle(others)
        .slice(0, 3)
        .map((c) => c.name);
      return {
        type,
        correctAnswer: chord.name,
        options: shuffle([chord.name, ...distractors]),
        rootMidi,
        notesToPlay: chord.intervals.map((i) => midiToNote(rootMidi + i)),
      };
    }
    case "scales": {
      const scale = pickRandom(SCALES);
      const others = SCALES.filter((s) => s.name !== scale.name);
      const distractors = shuffle(others)
        .slice(0, 3)
        .map((s) => s.name);
      return {
        type,
        correctAnswer: scale.name,
        options: shuffle([scale.name, ...distractors]),
        rootMidi,
        notesToPlay: scale.intervals.map((i) => midiToNote(rootMidi + i)),
      };
    }
    case "progressions": {
      const prog = pickRandom(PROGRESSIONS);
      const others = PROGRESSIONS.filter((p) => p.name !== prog.name);
      const distractors = shuffle(others).slice(0, 3).map((p) => p.name);
      const notesToPlay: string[] = [];
      for (const chord of prog.chords) {
        for (const interval of chord) {
          notesToPlay.push(midiToNote(rootMidi + interval));
        }
      }
      return {
        type,
        correctAnswer: prog.name,
        options: shuffle([prog.name, ...distractors]),
        rootMidi,
        notesToPlay,
      };
    }
    case "rhythm": {
      // Rhythm is handled by RhythmTrainer component, return a dummy question
      return {
        type,
        correctAnswer: "",
        options: [],
        rootMidi: 0,
        notesToPlay: [],
      };
    }
  }
}

/* ---------- Category card data ---------- */

const CATEGORIES: {
  id: ExerciseType;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  border: string;
  detail: string;
}[] = [
  {
    id: "single-notes",
    title: "Single Notes",
    description: "Identify the note played",
    icon: <Music className="w-6 h-6" />,
    gradient: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/20",
    detail: "12 notes across the chromatic scale",
  },
  {
    id: "intervals",
    title: "Intervals",
    description: "Hear two notes, name the interval",
    icon: <BarChart3 className="w-6 h-6" />,
    gradient: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
    detail: "Minor 2nd through Octave",
  },
  {
    id: "triads",
    title: "Triads",
    description: "Identify Major, Minor, Dim, Aug",
    icon: <Layers className="w-6 h-6" />,
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20",
    detail: "4 triad qualities",
  },
  {
    id: "seventh-chords",
    title: "Seventh Chords",
    description: "Maj7, Min7, Dom7, Dim7 and more",
    icon: <Zap className="w-6 h-6" />,
    gradient: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
    detail: "6 seventh chord types",
  },
  {
    id: "scales",
    title: "Scales",
    description: "Hear a scale, identify it",
    icon: <Headphones className="w-6 h-6" />,
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
    detail: "Major, Minor, Modes and more",
  },
  {
    id: "rhythm",
    title: "Rhythm",
    description: "Identify subdivisions and patterns",
    icon: <Timer className="w-6 h-6" />,
    gradient: "from-orange-500/20 to-red-500/10",
    border: "border-orange-500/20",
    detail: "Quavers, triplets, semiquavers",
  },
  {
    id: "progressions",
    title: "Progressions",
    description: "Identify chord progressions",
    icon: <GitBranch className="w-6 h-6" />,
    gradient: "from-indigo-500/20 to-blue-500/10",
    border: "border-indigo-500/20",
    detail: "Common 4-chord patterns",
  },
];

/* ---------- Main page component ---------- */

export default function EarTrainingPage() {
  const { initPiano, playNote, playNotes, playSequence, playChordSequence, isLoaded, isLoading } = usePiano();

  const [activeExercise, setActiveExercise] = useState<ExerciseType | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const questionPlayedRef = useRef(false);

  /* Play the current question's sound */
  const playCurrentQuestion = useCallback(() => {
    if (!question || !isLoaded) return;
    const { type, notesToPlay } = question;
    if (type === "single-notes") {
      playNote(notesToPlay[0]);
    } else if (type === "intervals") {
      playSequence(notesToPlay, 0.6);
    } else if (type === "triads" || type === "seventh-chords") {
      // Play as chord (simultaneous)
      playNotes(notesToPlay);
    } else if (type === "scales") {
      playSequence(notesToPlay, 0.35);
    } else if (type === "progressions") {
      // Group notes into chords of 3
      const chords: string[][] = [];
      for (let i = 0; i < notesToPlay.length; i += 3) {
        chords.push(notesToPlay.slice(i, i + 3));
      }
      playChordSequence(chords, 0.8);
    }
  }, [question, isLoaded, playNote, playNotes, playSequence, playChordSequence]);

  /* Start a new question */
  const nextQuestion = useCallback(
    (type: ExerciseType) => {
      const q = generateQuestion(type);
      setQuestion(q);
      setSelectedAnswer(null);
      setIsCorrect(null);
      questionPlayedRef.current = false;
    },
    []
  );

  /* Auto-play when question changes and piano is loaded */
  useEffect(() => {
    if (question && isLoaded && !questionPlayedRef.current) {
      const timer = setTimeout(() => {
        playCurrentQuestion();
        questionPlayedRef.current = true;
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [question, isLoaded, playCurrentQuestion]);

  /* Keyboard shortcut: Space to replay */
  useEffect(() => {
    if (!activeExercise || activeExercise === "rhythm" || !question) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        playCurrentQuestion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeExercise, question, playCurrentQuestion]);

  /* Start exercise — auto-loads piano if needed */
  const startExercise = useCallback(
    async (type: ExerciseType) => {
      setActiveExercise(type);
      setScore(0);
      setTotal(0);
      setStreak(0);
      setBestStreak(0);
      if (type !== "rhythm") {
        if (!isLoaded && !isLoading) {
          // Load piano first, then generate question so auto-play waits for loaded state
          await initPiano();
        }
        nextQuestion(type);
      }
    },
    [nextQuestion, isLoaded, isLoading, initPiano]
  );

  /* Handle answer selection */
  const handleAnswer = useCallback(
    (answer: string) => {
      if (!question || selectedAnswer !== null) return;
      setSelectedAnswer(answer);
      const correct = answer === question.correctAnswer;
      setIsCorrect(correct);
      setTotal((t) => t + 1);
      if (correct) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });
      } else {
        setStreak(0);
      }
    },
    [question, selectedAnswer]
  );

  /* Go back to category selection */
  const exitExercise = useCallback(() => {
    setActiveExercise(null);
    setQuestion(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, []);

  return (
    <main className="bg-[#0a0a08] text-slate-100 min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(124,58,237,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(6,182,212,0.06),transparent)]" />
      </div>

      <div className="relative z-10">
        {/* Top nav bar */}
        <div className="border-b border-white/[0.06] bg-[#0a0a08]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Home</span>
            </Link>

            {/* Piano status */}
            <div className="flex items-center gap-3">
              {isLoading && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.05]">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-medium uppercase tracking-[0.12em]">
                    Loading...
                  </span>
                </div>
              )}
              {isLoaded && (
                <div className="flex items-center gap-3">
                  <VolumeControl compact />
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.05]">
                    <span className="flex h-1.5 w-1.5 relative">
                      <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium uppercase tracking-[0.12em]">
                      Ready
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeExercise === "rhythm" ? (
            /* ---------- RHYTHM MODE ---------- */
            <motion.div
              key="rhythm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <RhythmTrainer />
            </motion.div>
          ) : activeExercise && question ? (
            /* ---------- EXERCISE MODE ---------- */
            <motion.div
              key="exercise"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-20"
            >
              {/* Exercise header */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={exitExercise}
                  className="flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to exercises
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm text-stone-400">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    <span className="font-display font-700 text-white">{score}</span>
                    <span className="text-stone-600">/</span>
                    <span>{total}</span>
                  </div>
                  {streak > 0 && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="font-display font-700 text-orange-400">{streak}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-white/[0.06] rounded-full mb-10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: total > 0 ? `${(score / total) * 100}%` : "0%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Category label */}
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-stone-400 uppercase tracking-[0.12em]">
                  {CATEGORIES.find((c) => c.id === activeExercise)?.title}
                </span>
              </div>

              {/* Play / Replay button — always visible */}
              <div className="flex flex-col items-center mb-10">
                {!isLoaded ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative flex items-center justify-center w-20 h-20 mb-3">
                      <div className="absolute inset-0 rounded-full border-2 border-violet-800/30" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-violet-400 border-b-transparent border-l-transparent animate-spin" />
                      <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                    </div>
                    <p className="text-stone-400 font-display font-500 text-sm">Loading piano...</p>
                    <p className="text-stone-600 text-xs mt-1">Salamander Grand Piano samples</p>
                  </motion.div>
                ) : (
                  <>
                    <motion.button
                      key={`play-${total}`}
                      initial={{ scale: 1 }}
                      animate={selectedAnswer === null ? {
                        scale: [1, 1.06, 1],
                        boxShadow: [
                          "0 0 20px rgba(124,58,237,0.3)",
                          "0 0 40px rgba(124,58,237,0.5)",
                          "0 0 20px rgba(124,58,237,0.3)",
                        ],
                      } : {}}
                      transition={selectedAnswer === null ? {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      } : {}}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={playCurrentQuestion}
                      className="relative group flex items-center gap-3 px-10 py-5 rounded-2xl font-display font-700 text-xl bg-gradient-to-br from-violet-600 to-violet-700 text-white hover:from-violet-500 hover:to-violet-600 transition-all"
                      style={{ boxShadow: "0 0 30px rgba(124,58,237,0.35)" }}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <Volume2 className="w-7 h-7" />
                      {selectedAnswer !== null ? "Replay Sound" : "Play Sound"}
                    </motion.button>
                    <span className="text-stone-600 text-xs mt-3 tracking-wide">
                      Press <kbd className="px-1.5 py-0.5 rounded border border-stone-700 bg-stone-800 text-stone-400 text-[10px] font-mono">Space</kbd> to replay
                    </span>
                  </>
                )}
              </div>

              {/* Question prompt */}
              <motion.p
                key={`q-${total}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-lg text-stone-300 font-display font-500 mb-8"
              >
                {activeExercise === "single-notes" && "What note is being played?"}
                {activeExercise === "intervals" && "What interval do you hear?"}
                {activeExercise === "triads" && "What type of triad is this?"}
                {activeExercise === "seventh-chords" && "What type of seventh chord is this?"}
                {activeExercise === "scales" && "What scale is being played?"}
                {activeExercise === "progressions" && "What chord progression do you hear?"}
              </motion.p>

              {/* Answer choices */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                {question.options.map((option, idx) => {
                  let btnClass =
                    "relative px-5 py-4 rounded-xl border text-left font-display font-600 text-sm transition-all ";

                  if (selectedAnswer === null) {
                    // Unanswered
                    btnClass +=
                      "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] text-stone-200 cursor-pointer";
                  } else if (option === question.correctAnswer) {
                    // Correct answer highlight
                    btnClass +=
                      "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-300";
                  } else if (option === selectedAnswer && !isCorrect) {
                    // Wrong answer highlight
                    btnClass +=
                      "border-red-500/40 bg-red-500/[0.12] text-red-300";
                  } else {
                    // Other options after answering
                    btnClass +=
                      "border-white/[0.04] bg-white/[0.01] text-stone-600";
                  }

                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedAnswer !== null}
                      className={btnClass}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        {selectedAnswer !== null && option === question.correctAnswer && (
                          <Check className="w-4 h-4 text-emerald-400" />
                        )}
                        {selectedAnswer === option && !isCorrect && (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                        {option}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback + Next */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <p
                      className={`font-display font-700 text-lg ${
                        isCorrect ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {isCorrect ? "Correct!" : `Incorrect -- the answer was ${question.correctAnswer}`}
                    </p>

                    <div className="flex items-center gap-3">
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={playCurrentQuestion}
                        className="flex items-center gap-2 px-5 py-3 rounded-xl font-display font-600 text-sm border border-violet-500/30 bg-violet-500/[0.1] hover:bg-violet-500/[0.2] text-violet-300 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                        Replay
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => nextQuestion(activeExercise)}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-600 text-sm bg-amber-700 hover:bg-amber-600 text-white transition-colors"
                        style={{
                          boxShadow: "0 0 20px rgba(180,83,9,0.25)",
                        }}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Next Question
                      </motion.button>
                    </div>

                    {bestStreak > 1 && (
                      <p className="text-xs text-stone-600 mt-2">
                        Best streak: {bestStreak}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* ---------- LANDING / CATEGORY SELECTION ---------- */
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Hero section */}
              <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/[0.06] backdrop-blur-sm mb-8"
                >
                  <Ear className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs text-violet-400 font-medium tracking-[0.12em] uppercase">
                    Ear Training Studio
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="font-display leading-[1.05] tracking-tight mb-6"
                >
                  <span className="block text-5xl sm:text-6xl md:text-7xl font-700"
                    style={{
                      background: "linear-gradient(135deg, #c4b5fd 0%, #7c3aed 40%, #06b6d4 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Ear Training
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-base md:text-lg text-stone-500 max-w-xl mx-auto leading-relaxed font-300 mb-10"
                >
                  Train your ear with high-quality piano sounds. Identify intervals, chords, and
                  scales by ear. Powered by Salamander Grand Piano samples.
                </motion.p>

                {/* Loading indicator — only during sample load */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/[0.05] mb-8"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span className="text-sm text-amber-400 font-medium">
                      Loading piano samples...
                    </span>
                  </motion.div>
                )}
              </section>

              {/* Category cards */}
              <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map((cat, idx) => (
                    <motion.button
                      key={cat.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 + idx * 0.07 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => startExercise(cat.id)}
                      className={`group relative text-left p-5 rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.gradient} backdrop-blur-sm transition-all hover:shadow-card-hover overflow-hidden`}
                    >
                      {/* Glow blob */}
                      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity bg-white/10" />

                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.06] text-stone-300 group-hover:text-white transition-colors">
                            {cat.icon}
                          </div>
                          <Play className="w-4 h-4 text-stone-600 group-hover:text-stone-300 transition-colors" />
                        </div>

                        <h3 className="font-display font-700 text-base text-white mb-1">
                          {cat.title}
                        </h3>
                        <p className="text-sm text-stone-400 mb-2">
                          {cat.description}
                        </p>
                        <p className="text-xs text-stone-600">
                          {cat.detail}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Tip section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-12 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <h3 className="font-display font-600 text-sm text-stone-300 mb-2 flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-violet-400" />
                    Training Tips
                  </h3>
                  <ul className="space-y-1.5 text-sm text-stone-500">
                    <li>Use headphones for the best experience with piano samples.</li>
                    <li>Start with intervals -- they are the foundation of ear training.</li>
                    <li>Try to sing or hum the notes before picking an answer.</li>
                    <li>Focus on building streaks to reinforce correct identification.</li>
                  </ul>
                </motion.div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
