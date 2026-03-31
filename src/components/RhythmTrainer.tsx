"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Volume2,
  RefreshCw,
  Check,
  X,
  Trophy,
  Flame,
  Minus,
  Plus,
} from "lucide-react";
import * as Tone from "tone";

/* ═══════ TYPES ═══════ */

interface SubdivisionType {
  name: string;
  perBeat: number;
  labels: string[];
}

const SUBDIVISIONS: SubdivisionType[] = [
  { name: "Crotchets (Quarter Notes)", perBeat: 1, labels: ["1", "2", "3", "4"] },
  { name: "Quavers (Eighth Notes)", perBeat: 2, labels: ["1", "&", "2", "&", "3", "&", "4", "&"] },
  { name: "Triplets", perBeat: 3, labels: ["1", "trip", "let", "2", "trip", "let", "3", "trip", "let", "4", "trip", "let"] },
  { name: "Semiquavers (Sixteenth Notes)", perBeat: 4, labels: ["1", "e", "&", "a", "2", "e", "&", "a", "3", "e", "&", "a", "4", "e", "&", "a"] },
];

interface RhythmQuestion {
  subdivision: SubdivisionType;
  pattern: boolean[];
  options: string[];
}

/* ═══════ HELPERS ═══════ */

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestion(): RhythmQuestion {
  const subdivision = SUBDIVISIONS[Math.floor(Math.random() * SUBDIVISIONS.length)];
  const totalCells = 4 * subdivision.perBeat;
  const pattern: boolean[] = [];

  // Always hit beat 1
  pattern.push(true);
  for (let i = 1; i < totalCells; i++) {
    // Downbeats (every perBeat cells) more likely to be hit
    const isDownbeat = i % subdivision.perBeat === 0;
    pattern.push(Math.random() < (isDownbeat ? 0.75 : 0.5));
  }

  const others = SUBDIVISIONS.filter((s) => s.name !== subdivision.name);
  const distractors = shuffle(others).slice(0, 3).map((s) => s.name);

  return {
    subdivision,
    pattern,
    options: shuffle([subdivision.name, ...distractors]),
  };
}

/* ═══════ BEAT GRID ═══════ */

function BeatGrid({
  beats,
  perBeat,
  pattern,
  currentStep,
  labels,
}: {
  beats: number;
  perBeat: number;
  pattern: boolean[];
  currentStep: number;
  labels: string[];
}) {
  const total = beats * perBeat;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Beat numbers */}
      <div className="flex mb-1">
        {Array.from({ length: beats }).map((_, b) => (
          <div key={b} className="flex-1 text-center">
            <span className="text-xs font-display font-700 text-stone-500">{b + 1}</span>
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="flex gap-[2px] p-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        {Array.from({ length: total }).map((_, i) => {
          const isHit = pattern[i];
          const isCurrent = i === currentStep;
          const isDownbeat = i % perBeat === 0;

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full aspect-square rounded-md transition-all duration-75 ${
                  isCurrent && isHit
                    ? "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-110"
                    : isCurrent && !isHit
                    ? "bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    : isHit
                    ? "bg-amber-600/60 border border-amber-500/30"
                    : "bg-white/[0.04] border border-white/[0.06]"
                } ${isDownbeat ? "ring-1 ring-white/[0.08]" : ""}`}
              />
              <span
                className={`text-[9px] font-mono leading-none ${
                  isDownbeat ? "text-stone-400 font-bold" : "text-stone-600"
                }`}
              >
                {labels[i] || ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════ MAIN COMPONENT ═══════ */

interface RhythmTrainerProps {
  onExit: () => void;
}

export default function RhythmTrainer({ onExit }: RhythmTrainerProps) {
  const [question, setQuestion] = useState<RhythmQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(100);

  // Synths
  const kickRef = useRef<Tone.MembraneSynth | null>(null);
  const hihatRef = useRef<Tone.MetalSynth | null>(null);
  const clickRef = useRef<Tone.Synth | null>(null);
  const initedRef = useRef(false);
  const seqRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!initedRef.current) {
      initedRef.current = true;

      kickRef.current = new Tone.MembraneSynth({
        pitchDecay: 0.02,
        octaves: 6,
        oscillator: { type: "sine" },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
      }).toDestination();
      kickRef.current.volume.value = -4;

      hihatRef.current = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.08, release: 0.05 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      } as any).toDestination(); // eslint-disable-line @typescript-eslint/no-explicit-any
      hihatRef.current.volume.value = -16;

      clickRef.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
      }).toDestination();
      clickRef.current.volume.value = -12;

      setQuestion(generateQuestion());
    }

    return () => {
      seqRef.current.forEach(clearTimeout);
      kickRef.current?.dispose();
      hihatRef.current?.dispose();
      clickRef.current?.dispose();
    };
  }, []);

  const playPattern = useCallback(async () => {
    if (!question || isPlaying) return;
    await Tone.start();
    setIsPlaying(true);

    const { subdivision, pattern } = question;
    const totalCells = pattern.length;
    const beatDuration = 60 / bpm; // seconds per beat
    const cellDuration = beatDuration / subdivision.perBeat;

    // Clear any pending timeouts
    seqRef.current.forEach(clearTimeout);
    seqRef.current = [];

    const now = Tone.now() + 0.05;

    for (let i = 0; i < totalCells; i++) {
      const time = now + i * cellDuration;
      const isDownbeat = i % subdivision.perBeat === 0;

      // Schedule step highlight
      const highlightTimer = setTimeout(() => setCurrentStep(i), i * cellDuration * 1000);
      seqRef.current.push(highlightTimer);

      // Play metronome click on downbeats
      if (isDownbeat && clickRef.current) {
        clickRef.current.triggerAttackRelease(i === 0 ? "G5" : "C5", "32n", time);
      }

      // Play kick on pattern hits
      if (pattern[i] && kickRef.current) {
        kickRef.current.triggerAttackRelease("C1", "8n", time);
      }

      // Light hihat on all subdivisions
      if (!isDownbeat && hihatRef.current) {
        hihatRef.current.triggerAttackRelease("16n", time, 0.03);
      }
    }

    // Reset after playback
    const totalDuration = totalCells * cellDuration * 1000 + 200;
    const endTimer = setTimeout(() => {
      setIsPlaying(false);
      setCurrentStep(-1);
    }, totalDuration);
    seqRef.current.push(endTimer);
  }, [question, isPlaying, bpm]);

  // Auto-play on new question
  useEffect(() => {
    if (question && !isPlaying) {
      const timer = setTimeout(playPattern, 500);
      return () => clearTimeout(timer);
    }
  }, [question]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!question || selectedAnswer !== null) return;
      setSelectedAnswer(answer);
      const correct = answer === question.subdivision.name;
      setIsCorrect(correct);
      setTotal((t) => t + 1);
      if (correct) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
      } else {
        setStreak(0);
      }
    },
    [question, selectedAnswer]
  );

  const nextQ = useCallback(() => {
    seqRef.current.forEach(clearTimeout);
    setCurrentStep(-1);
    setIsPlaying(false);
    setQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, []);

  if (!question) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onExit} className="flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-stone-400">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-display font-700 text-white">{score}</span>
            <span className="text-stone-600">/</span>
            <span>{total}</span>
          </div>
          {streak > 0 && (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-1.5 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-display font-700 text-orange-400">{streak}</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Accuracy bar */}
      <div className="w-full h-1 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
          animate={{ width: total > 0 ? `${(score / total) * 100}%` : "0%" }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* BPM Control */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <button onClick={() => setBpm((b) => Math.max(60, b - 10))} className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/[0.1] transition-all">
          <Minus className="w-3 h-3" />
        </button>
        <div className="px-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] min-w-[90px] text-center">
          <span className="font-display font-700 text-white text-sm">{bpm}</span>
          <span className="text-stone-500 text-xs ml-1">BPM</span>
        </div>
        <button onClick={() => setBpm((b) => Math.min(200, b + 10))} className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-stone-400 hover:text-white hover:bg-white/[0.1] transition-all">
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* ═══ BEAT GRID ═══ */}
      <div className="mb-8">
        <BeatGrid
          beats={4}
          perBeat={question.subdivision.perBeat}
          pattern={question.pattern}
          currentStep={currentStep}
          labels={question.subdivision.labels}
        />
      </div>

      {/* Play / Replay */}
      <div className="flex justify-center mb-8">
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={playPattern}
          disabled={isPlaying}
          className="relative group flex items-center gap-3 px-7 py-3.5 rounded-2xl font-display font-700 text-base bg-gradient-to-br from-orange-600 to-red-700 text-white hover:from-orange-500 hover:to-red-600 transition-all disabled:opacity-40"
        >
          <Volume2 className="w-5 h-5" />
          {isPlaying ? "Playing..." : selectedAnswer !== null ? "Replay" : "Play Rhythm"}
        </motion.button>
      </div>

      {/* Question */}
      <motion.p
        key={`q-${total}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-lg text-stone-300 font-display font-500 mb-6"
      >
        What subdivision do you hear?
      </motion.p>

      {/* Answer grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {question.options.map((option, idx) => {
          let cls = "relative px-4 py-3.5 rounded-xl border text-center font-display font-600 text-sm transition-all ";
          if (selectedAnswer === null) {
            cls += "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] text-stone-200 cursor-pointer";
          } else if (option === question.subdivision.name) {
            cls += "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-300";
          } else if (option === selectedAnswer && !isCorrect) {
            cls += "border-red-500/40 bg-red-500/[0.12] text-red-300";
          } else {
            cls += "border-white/[0.04] bg-white/[0.01] text-stone-600";
          }

          return (
            <motion.button
              key={option}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={cls}
            >
              <span className="flex items-center justify-center gap-2">
                {selectedAnswer !== null && option === question.subdivision.name && <Check className="w-4 h-4 text-emerald-400" />}
                {selectedAnswer === option && !isCorrect && <X className="w-4 h-4 text-red-400" />}
                {option}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {selectedAnswer !== null && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
            <p className={`font-display font-700 text-lg ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
              {isCorrect ? "Correct!" : `The answer was ${question.subdivision.name}`}
            </p>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={nextQ} className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-600 text-sm bg-amber-700 hover:bg-amber-600 text-white transition-colors" style={{ boxShadow: "0 0 20px rgba(180,83,9,0.25)" }}>
              <RefreshCw className="w-4 h-4" /> Next
            </motion.button>
            {bestStreak > 1 && <p className="text-xs text-stone-600">Best streak: {bestStreak}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
