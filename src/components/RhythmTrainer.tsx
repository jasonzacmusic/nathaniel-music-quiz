"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Square,
  RefreshCw,
  Trophy,
  Flame,
  Check,
  X,
  Timer,
  Waves,
  Hand,
  Minus,
  Plus,
  Volume2,
  Drum,
} from "lucide-react";
import * as Tone from "tone";
import VolumeControl from "@/components/VolumeControl";

/* ================================================================
   Types & Constants
   ================================================================ */

type ExerciseMode = "subdivision-id" | "pattern-match" | "tempo-feel" | "tap-back";

interface RhythmTrainerState {
  mode: ExerciseMode | null;
  isPlaying: boolean;
  tempo: number;
  currentStep: number;
  score: number;
  total: number;
  streak: number;
  bestStreak: number;
}

interface SubdivisionType {
  name: string;
  perBeat: number;
  labels: string[];
}

const SUBDIVISIONS: SubdivisionType[] = [
  { name: "Quarter Notes", perBeat: 1, labels: ["1", "2", "3", "4"] },
  {
    name: "Eighth Notes (Quavers)",
    perBeat: 2,
    labels: ["1", "&", "2", "&", "3", "&", "4", "&"],
  },
  {
    name: "Triplets",
    perBeat: 3,
    labels: [
      "1", "trip", "let", "2", "trip", "let",
      "3", "trip", "let", "4", "trip", "let",
    ],
  },
  {
    name: "Sixteenth Notes (Semiquavers)",
    perBeat: 4,
    labels: [
      "1", "e", "&", "a", "2", "e", "&", "a",
      "3", "e", "&", "a", "4", "e", "&", "a",
    ],
  },
];

const TEMPO_RANGES = [
  { label: "Slow (60-90)", min: 60, max: 90 },
  { label: "Medium (90-120)", min: 90, max: 120 },
  { label: "Fast (120-150)", min: 120, max: 150 },
  { label: "Very Fast (150-180)", min: 150, max: 180 },
];

const MODE_CARDS: {
  id: ExerciseMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  border: string;
  detail: string;
}[] = [
  {
    id: "subdivision-id",
    title: "Subdivision ID",
    description: "Identify the subdivision type",
    icon: <Waves className="w-6 h-6" />,
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/20",
    detail: "Quarter, Eighth, Triplet, Sixteenth",
  },
  {
    id: "pattern-match",
    title: "Pattern Matching",
    description: "Match what you hear to a grid",
    icon: <Drum className="w-6 h-6" />,
    gradient: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
    detail: "Visual step-sequencer recognition",
  },
  {
    id: "tempo-feel",
    title: "Tempo & Feel",
    description: "Identify tempo range and feel",
    icon: <Timer className="w-6 h-6" />,
    gradient: "from-cyan-500/20 to-blue-500/10",
    border: "border-cyan-500/20",
    detail: "Straight vs Swing, tempo ranges",
  },
  {
    id: "tap-back",
    title: "Tap Back",
    description: "Reproduce the rhythm by tapping",
    icon: <Hand className="w-6 h-6" />,
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
    detail: "Timing accuracy analysis",
  },
];

/* ================================================================
   Utility Functions
   ================================================================ */

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

/* ================================================================
   BeatGrid Sub-Component
   ================================================================ */

interface BeatGridProps {
  beats: number;
  subdivision: number;
  pattern: boolean[];
  currentStep: number;
  interactive?: boolean;
  onCellToggle?: (index: number) => void;
  compact?: boolean;
  label?: string;
  highlight?: "correct" | "wrong" | null;
}

function BeatGrid({
  beats,
  subdivision,
  pattern,
  currentStep,
  interactive = false,
  onCellToggle,
  compact = false,
  label,
  highlight = null,
}: BeatGridProps) {
  const totalCells = beats * subdivision;
  const subLabels =
    SUBDIVISIONS.find((s) => s.perBeat === subdivision)?.labels ?? [];

  const borderColor =
    highlight === "correct"
      ? "border-emerald-500/60"
      : highlight === "wrong"
        ? "border-red-500/60"
        : "border-white/[0.08]";

  const bgColor =
    highlight === "correct"
      ? "bg-emerald-500/[0.06]"
      : highlight === "wrong"
        ? "bg-red-500/[0.06]"
        : "bg-white/[0.02]";

  return (
    <div
      className={`rounded-xl border ${borderColor} ${bgColor} p-3 transition-all duration-300 ${
        interactive ? "cursor-pointer hover:border-white/[0.15]" : ""
      }`}
    >
      {label && (
        <p className="text-xs text-stone-500 font-display font-500 mb-2 text-center">
          {label}
        </p>
      )}

      {/* Beat numbers */}
      <div className="flex gap-px mb-1">
        {Array.from({ length: totalCells }).map((_, idx) => (
          <div key={idx} className="flex-1 text-center">
            {idx % subdivision === 0 ? (
              <span className="text-[10px] text-stone-500 font-display font-600">
                {Math.floor(idx / subdivision) + 1}
              </span>
            ) : (
              <span className="text-[10px] text-transparent">.</span>
            )}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="flex gap-px">
        {Array.from({ length: totalCells }).map((_, idx) => {
          const isHit = pattern[idx];
          const isCurrent = idx === currentStep;
          const isDownbeat = idx % subdivision === 0;

          let cellBg: string;
          if (isHit && isDownbeat) {
            cellBg =
              "bg-amber-500/80 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
          } else if (isHit) {
            cellBg =
              "bg-violet-500/70 border-violet-400/40 shadow-[0_0_6px_rgba(124,58,237,0.25)]";
          } else {
            cellBg = "bg-white/[0.04] border-white/[0.08]";
          }

          const cellSize = compact ? "h-7" : "h-10";
          const showSep = idx > 0 && idx % subdivision === 0;

          return (
            <div key={idx} className="flex-1 flex">
              {showSep && (
                <div className="w-0.5 bg-white/[0.1] mx-px rounded-full flex-shrink-0" />
              )}
              <button
                className={`flex-1 ${cellSize} rounded border transition-all relative ${cellBg} ${
                  interactive
                    ? "hover:border-white/30 hover:bg-white/[0.1] active:scale-95"
                    : ""
                }`}
                onClick={() => interactive && onCellToggle?.(idx)}
                disabled={!interactive}
              >
                {isCurrent && (
                  <div className="absolute inset-0 rounded ring-2 ring-white/80 shadow-[0_0_16px_rgba(255,255,255,0.5)] z-10" />
                )}
                {isHit && isCurrent && (
                  <motion.div
                    key={`pulse-${currentStep}`}
                    initial={{ scale: 1.5, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 rounded bg-white/30"
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Subdivision labels */}
      {!compact && (
        <div className="flex gap-px mt-1">
          {subLabels.map((lbl, idx) => (
            <div key={idx} className="flex-1 text-center">
              <span
                className={`text-[9px] ${
                  idx % subdivision === 0
                    ? "text-stone-400 font-600"
                    : "text-stone-600"
                } font-display`}
              >
                {lbl}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Question Generation
   ================================================================ */

interface SubdivisionQuestion {
  subdivision: SubdivisionType;
  pattern: boolean[];
  options: string[];
}

function generateSubdivisionQuestion(): SubdivisionQuestion {
  const chosen = pickRandom(SUBDIVISIONS);
  const totalCells = 4 * chosen.perBeat;
  // ALL subdivision points are hit — the user must identify the subdivision type
  // by hearing how many hits per beat (1=quarter, 2=quaver, 3=triplet, 4=semiquaver)
  const pattern = Array(totalCells).fill(true) as boolean[];
  const options = shuffle(SUBDIVISIONS.map((s) => s.name));
  return { subdivision: chosen, pattern, options };
}

interface PatternQuestion {
  subdivision: SubdivisionType;
  correctPattern: boolean[];
  allPatterns: boolean[][];
  correctIndex: number;
}

function generatePatternQuestion(): PatternQuestion {
  const subdivision = pickRandom(SUBDIVISIONS.filter((s) => s.perBeat <= 3));
  const totalCells = 4 * subdivision.perBeat;

  function makePattern(): boolean[] {
    const p = Array(totalCells).fill(false) as boolean[];
    p[0] = true;
    for (let i = 1; i < totalCells; i++) {
      p[i] = Math.random() < 0.55;
    }
    return p;
  }

  function patternKey(p: boolean[]): string {
    return p.map((v) => (v ? "1" : "0")).join("");
  }

  const correct = makePattern();
  const patterns: boolean[][] = [correct];
  const usedKeys = new Set([patternKey(correct)]);

  while (patterns.length < 4) {
    const p = makePattern();
    const k = patternKey(p);
    if (!usedKeys.has(k)) {
      patterns.push(p);
      usedKeys.add(k);
    }
  }

  const shuffled = shuffle(patterns);
  const correctIndex = shuffled.indexOf(correct);

  return {
    subdivision,
    correctPattern: correct,
    allPatterns: shuffled,
    correctIndex,
  };
}

interface TempoFeelQuestion {
  type: "tempo" | "feel";
  actualTempo: number;
  isSwing: boolean;
  pattern: boolean[];
  subdivision: SubdivisionType;
  options: string[];
  correctAnswer: string;
}

function generateTempoFeelQuestion(): TempoFeelQuestion {
  const isTempoQ = Math.random() < 0.5;
  const subdivision = SUBDIVISIONS[1]; // eighth notes
  const totalCells = 8;
  const pattern = Array(totalCells).fill(false) as boolean[];
  pattern[0] = true;
  for (let i = 1; i < totalCells; i++) pattern[i] = Math.random() < 0.6;

  if (isTempoQ) {
    const range = pickRandom(TEMPO_RANGES);
    const tempo =
      range.min + Math.floor(Math.random() * (range.max - range.min));
    return {
      type: "tempo",
      actualTempo: tempo,
      isSwing: false,
      pattern,
      subdivision,
      options: TEMPO_RANGES.map((r) => r.label),
      correctAnswer: range.label,
    };
  } else {
    const swing = Math.random() < 0.5;
    const tempo = 90 + Math.floor(Math.random() * 30);
    return {
      type: "feel",
      actualTempo: tempo,
      isSwing: swing,
      pattern,
      subdivision,
      options: ["Straight", "Swing"],
      correctAnswer: swing ? "Swing" : "Straight",
    };
  }
}

interface TapBackQuestion {
  pattern: boolean[];
  subdivision: SubdivisionType;
  expectedTimes: number[];
}

function generateTapBackQuestion(tempo: number): TapBackQuestion {
  const subdivision = SUBDIVISIONS[1]; // eighth notes
  const totalCells = 8;
  const pattern = Array(totalCells).fill(false) as boolean[];
  pattern[0] = true;
  const hitCount = 3 + Math.floor(Math.random() * 3);
  const candidates = shuffle(
    Array.from({ length: 7 }, (_, i) => i + 1)
  ).slice(0, hitCount);
  candidates.forEach((i) => (pattern[i] = true));

  const beatDuration = 60 / tempo;
  const cellDuration = beatDuration / subdivision.perBeat;
  const expectedTimes = pattern
    .map((hit, i) => (hit ? i * cellDuration * 1000 : -1))
    .filter((t) => t >= 0);

  return { pattern, subdivision, expectedTimes };
}

/* ================================================================
   Main Component
   ================================================================ */

export default function RhythmTrainer() {
  /* ---- Core state ---- */
  const [state, setState] = useState<RhythmTrainerState>({
    mode: null,
    isPlaying: false,
    tempo: 100,
    currentStep: -1,
    score: 0,
    total: 0,
    streak: 0,
    bestStreak: 0,
  });

  const [selectedAnswer, setSelectedAnswer] = useState<
    string | number | null
  >(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  /* ---- Per-mode question state ---- */
  const [subdivQ, setSubdivQ] = useState<SubdivisionQuestion | null>(null);
  const [patternQ, setPatternQ] = useState<PatternQuestion | null>(null);
  const [tempoFeelQ, setTempoFeelQ] = useState<TempoFeelQuestion | null>(
    null
  );
  const [tapQ, setTapQ] = useState<TapBackQuestion | null>(null);

  /* ---- Tap-back state ---- */
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tapStartTime, setTapStartTime] = useState<number | null>(null);
  const [tapAccuracy, setTapAccuracy] = useState<number | null>(null);
  const [tapPhase, setTapPhase] = useState<"listen" | "tap" | "result">(
    "listen"
  );

  /* ---- Tap tempo ---- */
  const tapTempoTimesRef = useRef<number[]>([]);

  /* ---- Tone.js refs ---- */
  const kickRef = useRef<Tone.MembraneSynth | null>(null);
  const hihatRef = useRef<Tone.MetalSynth | null>(null);
  const clickRef = useRef<Tone.Synth | null>(null);
  const isPlayingRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const stepRef = useRef(0);

  /* ---- Initialise Tone.js instruments lazily ---- */
  const initInstruments = useCallback(() => {
    if (kickRef.current) return;

    kickRef.current = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 },
    }).toDestination();
    kickRef.current.volume.value = -6;

    hihatRef.current = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();
    hihatRef.current.frequency.value = 400;
    hihatRef.current.volume.value = -10;

    clickRef.current = new Tone.Synth({
      oscillator: { type: "triangle" },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 },
    }).toDestination();
    clickRef.current.volume.value = -12;
  }, []);

  /* ---- Cleanup on unmount ---- */
  useEffect(() => {
    return () => {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      kickRef.current?.dispose();
      hihatRef.current?.dispose();
      clickRef.current?.dispose();
    };
  }, []);

  /* ---- Stop playback ---- */
  const stopPlayback = useCallback(() => {
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    transport.position = 0;
    isPlayingRef.current = false;
    stepRef.current = 0;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setState((s) => ({ ...s, isPlaying: false, currentStep: -1 }));
  }, []);

  /* ---- Play a pattern with Tone.Transport ---- */
  const playPattern = useCallback(
    (
      pattern: boolean[],
      subdivision: number,
      tempo: number,
      swing = false,
      onComplete?: () => void
    ) => {
      initInstruments();
      stopPlayback();

      const startPlay = async () => {
        await Tone.start();
        const transport = Tone.getTransport();
        transport.bpm.value = tempo;
        transport.swing = swing ? 0.5 : 0;
        transport.swingSubdivision = "8n";

        const totalCells = pattern.length;
        stepRef.current = 0;

        const noteName =
          subdivision === 1
            ? "4n"
            : subdivision === 2
              ? "8n"
              : subdivision === 3
                ? "8t"
                : "16n";

        transport.scheduleRepeat(
          (time) => {
            const step = stepRef.current;
            if (step >= totalCells) {
              transport.stop();
              isPlayingRef.current = false;
              if (onComplete) setTimeout(onComplete, 200);
              return;
            }

            const isQuarterBeat = step % subdivision === 0;
            const isBeat1 = step === 0;

            // Strong metronome click on every quarter-note beat
            if (isQuarterBeat) {
              clickRef.current?.triggerAttackRelease(
                isBeat1 ? "G5" : "E5",
                "32n",
                time,
                isBeat1 ? 0.6 : 0.4
              );
              // Kick on downbeats for a clear pulse
              kickRef.current?.triggerAttackRelease("C1", "8n", time, isBeat1 ? 0.9 : 0.6);
            }

            // Subdivision hits — hihat on every subdivision point
            if (pattern[step] && !isQuarterBeat) {
              hihatRef.current?.triggerAttackRelease("16n", time, 0.5);
            }

            stepRef.current = step + 1;
          },
          noteName,
          0
        );

        isPlayingRef.current = true;
        setState((s) => ({ ...s, isPlaying: true, currentStep: 0 }));
        transport.start();

        // Animate grid cursor via requestAnimationFrame
        const ppq = transport.PPQ;
        const ticksPerCell =
          subdivision === 1
            ? ppq
            : subdivision === 2
              ? ppq / 2
              : subdivision === 3
                ? ppq / 3
                : ppq / 4;

        const animate = () => {
          if (!isPlayingRef.current) {
            setState((s) => ({ ...s, currentStep: -1, isPlaying: false }));
            return;
          }
          const ticks = transport.ticks;
          const currentStepCalc = Math.min(
            Math.floor(ticks / ticksPerCell),
            totalCells - 1
          );
          setState((s) => ({ ...s, currentStep: currentStepCalc }));
          animFrameRef.current = requestAnimationFrame(animate);
        };
        animFrameRef.current = requestAnimationFrame(animate);
      };

      startPlay();
    },
    [initInstruments, stopPlayback]
  );

  /* ---- Score helper ---- */
  const recordAnswer = useCallback((correct: boolean) => {
    setIsCorrect(correct);
    setState((s) => {
      const newStreak = correct ? s.streak + 1 : 0;
      return {
        ...s,
        total: s.total + 1,
        score: s.score + (correct ? 1 : 0),
        streak: newStreak,
        bestStreak: Math.max(s.bestStreak, newStreak),
      };
    });
  }, []);

  /* ---- Start a mode ---- */
  const startMode = useCallback(
    (mode: ExerciseMode) => {
      stopPlayback();
      setState((s) => ({
        ...s,
        mode,
        score: 0,
        total: 0,
        streak: 0,
        bestStreak: 0,
      }));
      setSelectedAnswer(null);
      setIsCorrect(null);

      if (mode === "subdivision-id") setSubdivQ(generateSubdivisionQuestion());
      else if (mode === "pattern-match")
        setPatternQ(generatePatternQuestion());
      else if (mode === "tempo-feel")
        setTempoFeelQ(generateTempoFeelQuestion());
      else if (mode === "tap-back") {
        setTapQ(generateTapBackQuestion(state.tempo));
        setTapPhase("listen");
        setTapTimes([]);
        setTapAccuracy(null);
      }
    },
    [stopPlayback, state.tempo]
  );

  const exitMode = useCallback(() => {
    stopPlayback();
    setState((s) => ({ ...s, mode: null }));
  }, [stopPlayback]);

  /* ---- Next question ---- */
  const nextQuestion = useCallback(() => {
    stopPlayback();
    setSelectedAnswer(null);
    setIsCorrect(null);

    if (state.mode === "subdivision-id")
      setSubdivQ(generateSubdivisionQuestion());
    else if (state.mode === "pattern-match")
      setPatternQ(generatePatternQuestion());
    else if (state.mode === "tempo-feel")
      setTempoFeelQ(generateTempoFeelQuestion());
    else if (state.mode === "tap-back") {
      setTapQ(generateTapBackQuestion(state.tempo));
      setTapPhase("listen");
      setTapTimes([]);
      setTapAccuracy(null);
    }
  }, [stopPlayback, state.mode, state.tempo]);

  /* ---- Play current question ---- */
  const playCurrentQuestion = useCallback(() => {
    if (state.mode === "subdivision-id" && subdivQ) {
      playPattern(subdivQ.pattern, subdivQ.subdivision.perBeat, state.tempo);
    } else if (state.mode === "pattern-match" && patternQ) {
      playPattern(
        patternQ.correctPattern,
        patternQ.subdivision.perBeat,
        state.tempo
      );
    } else if (state.mode === "tempo-feel" && tempoFeelQ) {
      playPattern(
        tempoFeelQ.pattern,
        tempoFeelQ.subdivision.perBeat,
        tempoFeelQ.actualTempo,
        tempoFeelQ.isSwing
      );
    } else if (state.mode === "tap-back" && tapQ) {
      setTapPhase("listen");
      playPattern(
        tapQ.pattern,
        tapQ.subdivision.perBeat,
        state.tempo,
        false,
        () => {
          setTapPhase("tap");
          setTapStartTime(null);
          setTapTimes([]);
        }
      );
    }
  }, [
    state.mode,
    state.tempo,
    subdivQ,
    patternQ,
    tempoFeelQ,
    tapQ,
    playPattern,
  ]);

  /* ---- Answer handlers ---- */
  const handleSubdivAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null || !subdivQ) return;
      setSelectedAnswer(answer);
      recordAnswer(answer === subdivQ.subdivision.name);
    },
    [selectedAnswer, subdivQ, recordAnswer]
  );

  const handlePatternAnswer = useCallback(
    (index: number) => {
      if (selectedAnswer !== null || !patternQ) return;
      setSelectedAnswer(index);
      recordAnswer(index === patternQ.correctIndex);
    },
    [selectedAnswer, patternQ, recordAnswer]
  );

  const handleTempoFeelAnswer = useCallback(
    (answer: string) => {
      if (selectedAnswer !== null || !tempoFeelQ) return;
      setSelectedAnswer(answer);
      recordAnswer(answer === tempoFeelQ.correctAnswer);
    },
    [selectedAnswer, tempoFeelQ, recordAnswer]
  );

  /* ---- Tap handler ---- */
  const handleTap = useCallback(() => {
    if (tapPhase !== "tap" || !tapQ) return;
    const now = performance.now();
    if (tapStartTime === null) {
      setTapStartTime(now);
      setTapTimes([0]);
    } else {
      setTapTimes((prev) => [...prev, now - tapStartTime]);
    }
  }, [tapPhase, tapQ, tapStartTime]);

  /* ---- Analyse taps ---- */
  const analyzeTaps = useCallback(() => {
    if (!tapQ || tapTimes.length === 0) {
      setTapAccuracy(0);
      setTapPhase("result");
      recordAnswer(false);
      return;
    }

    const expected = tapQ.expectedTimes;
    const beatDuration = (60 / state.tempo) * 1000;
    const matchCount = Math.min(tapTimes.length, expected.length);

    let totalDeviation = 0;
    for (let i = 0; i < matchCount; i++) {
      let minDev = Infinity;
      for (const exp of expected) {
        minDev = Math.min(minDev, Math.abs(tapTimes[i] - exp));
      }
      totalDeviation += minDev;
    }

    const avgDev = totalDeviation / matchCount;
    const maxAcceptable = beatDuration / 4;
    const accuracy = Math.max(
      0,
      Math.min(100, Math.round(100 * (1 - avgDev / maxAcceptable)))
    );
    const countPenalty = Math.abs(tapTimes.length - expected.length) * 10;
    const finalAccuracy = Math.max(0, accuracy - countPenalty);

    setTapAccuracy(finalAccuracy);
    setTapPhase("result");
    recordAnswer(finalAccuracy >= 60);
  }, [tapQ, tapTimes, state.tempo, recordAnswer]);

  /* ---- Tap tempo ---- */
  const handleTapTempo = useCallback(() => {
    const now = performance.now();
    const times = tapTempoTimesRef.current;
    times.push(now);
    if (times.length > 5) times.shift();

    if (times.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < times.length; i++) {
        intervals.push(times[i] - times[i - 1]);
      }
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.max(60, Math.min(180, Math.round(60000 / avg)));
      setState((s) => ({ ...s, tempo: bpm }));
    }
  }, []);

  /* ---- Keyboard shortcuts ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (state.mode === "tap-back" && tapPhase === "tap") {
          handleTap();
        } else if (state.isPlaying) {
          stopPlayback();
        } else if (state.mode) {
          playCurrentQuestion();
        }
      }
      if (e.code === "Enter") {
        if (selectedAnswer !== null) {
          e.preventDefault();
          nextQuestion();
        }
        if (state.mode === "tap-back" && tapPhase === "result") {
          e.preventDefault();
          nextQuestion();
        }
      }

      const num = parseInt(e.key);
      if (isNaN(num) || num < 1) return;

      if (
        state.mode === "subdivision-id" &&
        subdivQ &&
        selectedAnswer === null
      ) {
        if (num <= subdivQ.options.length)
          handleSubdivAnswer(subdivQ.options[num - 1]);
      }
      if (
        state.mode === "pattern-match" &&
        patternQ &&
        selectedAnswer === null
      ) {
        if (num <= 4) handlePatternAnswer(num - 1);
      }
      if (
        state.mode === "tempo-feel" &&
        tempoFeelQ &&
        selectedAnswer === null
      ) {
        if (num <= tempoFeelQ.options.length)
          handleTempoFeelAnswer(tempoFeelQ.options[num - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    state,
    selectedAnswer,
    subdivQ,
    patternQ,
    tempoFeelQ,
    tapPhase,
    handleTap,
    stopPlayback,
    playCurrentQuestion,
    nextQuestion,
    handleSubdivAnswer,
    handlePatternAnswer,
    handleTempoFeelAnswer,
  ]);

  /* ---- Display pattern for the beat grid ---- */
  const displayPattern = useMemo(() => {
    if (state.mode === "subdivision-id" && subdivQ)
      return {
        pattern: subdivQ.pattern,
        subdivision: subdivQ.subdivision.perBeat,
      };
    if (state.mode === "tempo-feel" && tempoFeelQ)
      return {
        pattern: tempoFeelQ.pattern,
        subdivision: tempoFeelQ.subdivision.perBeat,
      };
    if (state.mode === "tap-back" && tapQ)
      return {
        pattern: tapQ.pattern,
        subdivision: tapQ.subdivision.perBeat,
      };
    return null;
  }, [state.mode, subdivQ, tempoFeelQ, tapQ]);

  /* ================================================================
     Render helper: answer button
     ================================================================ */

  const renderAnswerButton = (
    option: string,
    idx: number,
    correctAnswer: string,
    onClick: () => void
  ) => {
    let btnClass =
      "relative px-5 py-4 rounded-xl border text-left font-display font-600 text-sm transition-all ";
    if (selectedAnswer === null) {
      btnClass +=
        "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.15] text-stone-200 cursor-pointer";
    } else if (option === correctAnswer) {
      btnClass +=
        "border-emerald-500/40 bg-emerald-500/[0.12] text-emerald-300";
    } else if (option === selectedAnswer && !isCorrect) {
      btnClass += "border-red-500/40 bg-red-500/[0.12] text-red-300";
    } else {
      btnClass += "border-white/[0.04] bg-white/[0.01] text-stone-600";
    }

    return (
      <motion.button
        key={option}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        onClick={onClick}
        disabled={selectedAnswer !== null}
        className={btnClass}
      >
        <span className="flex items-center gap-2">
          <span className="text-xs text-stone-600 font-display">
            {idx + 1}.
          </span>
          {selectedAnswer !== null && option === correctAnswer && (
            <Check className="w-4 h-4 text-emerald-400" />
          )}
          {selectedAnswer === option && !isCorrect && (
            <X className="w-4 h-4 text-red-400" />
          )}
          {option}
        </span>
      </motion.button>
    );
  };

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {state.mode === null ? (
          /* ==================== MODE SELECTION ==================== */
          <motion.div
            key="mode-select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Heading */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-amber-500/20 bg-amber-500/[0.06] backdrop-blur-sm mb-6"
              >
                <Drum className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-amber-400 font-medium tracking-[0.12em] uppercase">
                  Rhythm Training
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display leading-[1.05] tracking-tight mb-4"
              >
                <span
                  className="block text-4xl sm:text-5xl font-700"
                  style={{
                    background:
                      "linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #7c3aed 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Rhythm Trainer
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base text-stone-500 max-w-lg mx-auto leading-relaxed font-300 mb-8"
              >
                Master rhythmic subdivisions, pattern recognition, tempo
                awareness, and timing precision with interactive drum
                exercises.
              </motion.p>
            </div>

            {/* Volume control */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="max-w-sm mx-auto mb-4"
            >
              <VolumeControl />
            </motion.div>

            {/* Tempo control */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-sm mx-auto mb-10 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-stone-500 font-display font-500 uppercase tracking-[0.1em]">
                  Default Tempo
                </span>
                <span className="font-display font-700 text-xl text-white">
                  {state.tempo}{" "}
                  <span className="text-xs text-stone-500 font-500">
                    BPM
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      tempo: Math.max(60, s.tempo - 5),
                    }))
                  }
                  className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-stone-400 hover:text-white transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={60}
                  max={180}
                  value={state.tempo}
                  onChange={(e) =>
                    setState((s) => ({
                      ...s,
                      tempo: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1 h-1.5 bg-white/[0.06] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                />
                <button
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      tempo: Math.min(180, s.tempo + 5),
                    }))
                  }
                  className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-stone-400 hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={handleTapTempo}
                className="mt-3 w-full py-2 rounded-lg border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-xs text-stone-400 hover:text-stone-200 font-display font-500 transition-all active:scale-95"
              >
                Tap Tempo
              </button>
            </motion.div>

            {/* Mode cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {MODE_CARDS.map((card, idx) => (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15 + idx * 0.07,
                  }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => startMode(card.id)}
                  className={`group relative text-left p-5 rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} backdrop-blur-sm transition-all hover:shadow-card-hover overflow-hidden`}
                >
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity bg-white/10" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-white/[0.06] border border-white/[0.06] text-stone-300 group-hover:text-white transition-colors">
                        {card.icon}
                      </div>
                      <Play className="w-4 h-4 text-stone-600 group-hover:text-stone-300 transition-colors" />
                    </div>
                    <h3 className="font-display font-700 text-base text-white mb-1">
                      {card.title}
                    </h3>
                    <p className="text-sm text-stone-400 mb-2">
                      {card.description}
                    </p>
                    <p className="text-xs text-stone-600">
                      {card.detail}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] max-w-2xl mx-auto"
            >
              <h3 className="font-display font-600 text-sm text-stone-300 mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Rhythm Tips
              </h3>
              <ul className="space-y-1.5 text-sm text-stone-500">
                <li>
                  Use headphones for best timing perception.
                </li>
                <li>
                  Start slow -- increase tempo only after you can
                  consistently identify subdivisions.
                </li>
                <li>
                  Tap your foot to the metronome click before focusing on
                  the pattern.
                </li>
                <li>
                  Keyboard: spacebar plays/stops, number keys select
                  answers, enter for next.
                </li>
              </ul>
            </motion.div>
          </motion.div>
        ) : (
          /* ==================== EXERCISE MODE ==================== */
          <motion.div
            key="exercise"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header: back + volume + score */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={exitMode}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-300 transition-colors text-sm"
              >
                <span className="text-lg">&larr;</span>
                Back to modes
              </button>
              <div className="flex items-center gap-4">
                <VolumeControl compact />
                <div className="flex items-center gap-1.5 text-sm text-stone-400">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="font-display font-700 text-white">
                    {state.score}
                  </span>
                  <span className="text-stone-600">/</span>
                  <span>{state.total}</span>
                </div>
                {state.streak > 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-display font-700 text-orange-400">
                      {state.streak}
                    </span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-white/[0.06] rounded-full mb-8 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-violet-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width:
                    state.total > 0
                      ? `${(state.score / state.total) * 100}%`
                      : "0%",
                }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* Mode label */}
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-stone-400 uppercase tracking-[0.12em]">
                {MODE_CARDS.find((c) => c.id === state.mode)?.title}
              </span>
            </div>

            {/* Tempo display + controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      tempo: Math.max(60, s.tempo - 5),
                    }))
                  }
                  className="p-1 rounded border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-stone-500 hover:text-white transition-all"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-display font-700 text-white text-sm w-20 text-center">
                  {state.mode === "tempo-feel" && tempoFeelQ
                    ? "???"
                    : state.tempo}{" "}
                  <span className="text-stone-600 font-500 text-xs">
                    BPM
                  </span>
                </span>
                <button
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      tempo: Math.min(180, s.tempo + 5),
                    }))
                  }
                  className="p-1 rounded border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-stone-500 hover:text-white transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Play / Stop button */}
            <div className="flex justify-center mb-6">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={
                  state.isPlaying ? stopPlayback : playCurrentQuestion
                }
                className={`relative group flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-700 text-lg transition-all ${
                  state.isPlaying
                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    : "bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-[0_0_20px_rgba(180,83,9,0.3)]"
                }`}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                {state.isPlaying ? (
                  <>
                    <Square className="w-6 h-6" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />{" "}
                    {selectedAnswer !== null
                      ? "Replay"
                      : "Play Pattern"}
                  </>
                )}
              </motion.button>
            </div>

            {/* Beat Grid -- shown for subdiv-id, tempo-feel, tap-back */}
            {displayPattern && (
              <div className="mb-8 max-w-lg mx-auto">
                <BeatGrid
                  beats={4}
                  subdivision={displayPattern.subdivision}
                  pattern={
                    state.mode === "subdivision-id" &&
                    selectedAnswer === null
                      ? Array(displayPattern.pattern.length).fill(
                          false
                        )
                      : displayPattern.pattern
                  }
                  currentStep={state.currentStep}
                />
              </div>
            )}

            {/* ========= SUBDIVISION ID ========= */}
            {state.mode === "subdivision-id" && subdivQ && (
              <>
                <motion.p
                  key={`q-${state.total}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-lg text-stone-300 font-display font-500 mb-6"
                >
                  What subdivision do you hear?
                </motion.p>
                <div className="grid grid-cols-2 gap-3 mb-8 max-w-lg mx-auto">
                  {subdivQ.options.map((option, idx) =>
                    renderAnswerButton(
                      option,
                      idx,
                      subdivQ.subdivision.name,
                      () => handleSubdivAnswer(option)
                    )
                  )}
                </div>
              </>
            )}

            {/* ========= PATTERN MATCH ========= */}
            {state.mode === "pattern-match" && patternQ && (
              <>
                <motion.p
                  key={`q-${state.total}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-lg text-stone-300 font-display font-500 mb-6"
                >
                  Which pattern matches what you heard?
                </motion.p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-2xl mx-auto">
                  {patternQ.allPatterns.map((pat, idx) => {
                    let hl: "correct" | "wrong" | null = null;
                    if (selectedAnswer !== null) {
                      if (idx === patternQ.correctIndex)
                        hl = "correct";
                      else if (idx === selectedAnswer) hl = "wrong";
                    }
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.07 }}
                        onClick={() => handlePatternAnswer(idx)}
                        className={
                          selectedAnswer === null
                            ? "cursor-pointer"
                            : ""
                        }
                      >
                        <BeatGrid
                          beats={4}
                          subdivision={
                            patternQ.subdivision.perBeat
                          }
                          pattern={pat}
                          currentStep={-1}
                          compact
                          label={`Pattern ${idx + 1}`}
                          highlight={hl}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ========= TEMPO & FEEL ========= */}
            {state.mode === "tempo-feel" && tempoFeelQ && (
              <>
                <motion.p
                  key={`q-${state.total}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-lg text-stone-300 font-display font-500 mb-6"
                >
                  {tempoFeelQ.type === "tempo"
                    ? "What tempo range is this pattern?"
                    : "Is the feel straight or swing?"}
                </motion.p>
                <div className="grid grid-cols-2 gap-3 mb-8 max-w-lg mx-auto">
                  {tempoFeelQ.options.map((option, idx) =>
                    renderAnswerButton(
                      option,
                      idx,
                      tempoFeelQ.correctAnswer,
                      () => handleTempoFeelAnswer(option)
                    )
                  )}
                </div>
              </>
            )}

            {/* ========= TAP BACK ========= */}
            {state.mode === "tap-back" && tapQ && (
              <>
                <motion.p
                  key={`q-${state.total}-${tapPhase}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center text-lg text-stone-300 font-display font-500 mb-6"
                >
                  {tapPhase === "listen" &&
                    "Listen to the pattern, then tap it back"}
                  {tapPhase === "tap" &&
                    "Now tap the rhythm! Press spacebar or tap the button"}
                  {tapPhase === "result" && "Results"}
                </motion.p>

                {tapPhase === "tap" && (
                  <div className="flex flex-col items-center gap-4 mb-8">
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.85 }}
                      onMouseDown={handleTap}
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 border-2 border-violet-400/40 shadow-[0_0_30px_rgba(124,58,237,0.4)] flex items-center justify-center text-white font-display font-700 text-xl transition-all active:shadow-[0_0_50px_rgba(124,58,237,0.7)]"
                    >
                      TAP
                    </motion.button>
                    <p className="text-xs text-stone-500">
                      Taps: {tapTimes.length} /{" "}
                      {tapQ.expectedTimes.length} expected
                    </p>
                    <button
                      onClick={analyzeTaps}
                      disabled={tapTimes.length === 0}
                      className="px-5 py-2 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-sm font-display font-600 disabled:opacity-30 transition-all"
                    >
                      Done Tapping
                    </button>
                  </div>
                )}

                {tapPhase === "result" && tapAccuracy !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 mb-8"
                  >
                    {/* Accuracy ring */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg
                        className="absolute inset-0 w-full h-full -rotate-90"
                        viewBox="0 0 100 100"
                      >
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="6"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          fill="none"
                          stroke={
                            tapAccuracy >= 60
                              ? "#22c55e"
                              : "#ef4444"
                          }
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${
                            tapAccuracy * 2.64
                          } ${264 - tapAccuracy * 2.64}`}
                        />
                      </svg>
                      <span
                        className={`font-display font-700 text-2xl ${
                          tapAccuracy >= 60
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        {tapAccuracy}%
                      </span>
                    </div>
                    <p
                      className={`font-display font-600 text-sm ${
                        tapAccuracy >= 60
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {tapAccuracy >= 90
                        ? "Exceptional timing!"
                        : tapAccuracy >= 70
                          ? "Good rhythm feel"
                          : tapAccuracy >= 60
                            ? "Not bad, keep practicing"
                            : "Keep working on it"}
                    </p>
                    <p className="text-xs text-stone-500">
                      You tapped {tapTimes.length} times, expected{" "}
                      {tapQ.expectedTimes.length}
                    </p>
                  </motion.div>
                )}
              </>
            )}

            {/* ========= FEEDBACK + NEXT ========= */}
            <AnimatePresence>
              {selectedAnswer !== null &&
                state.mode !== "tap-back" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <p
                      className={`font-display font-700 text-lg ${
                        isCorrect
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {isCorrect ? "Correct!" : "Incorrect"}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={nextQuestion}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-600 text-sm bg-amber-700 hover:bg-amber-600 text-white transition-colors"
                      style={{
                        boxShadow:
                          "0 0 20px rgba(180,83,9,0.25)",
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Next Question
                    </motion.button>
                    {state.bestStreak > 1 && (
                      <p className="text-xs text-stone-600 mt-1">
                        Best streak: {state.bestStreak}
                      </p>
                    )}
                  </motion.div>
                )}

              {state.mode === "tap-back" &&
                tapPhase === "result" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={nextQuestion}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl font-display font-600 text-sm bg-amber-700 hover:bg-amber-600 text-white transition-colors"
                      style={{
                        boxShadow:
                          "0 0 20px rgba(180,83,9,0.25)",
                      }}
                    >
                      <RefreshCw className="w-4 h-4" />
                      Next Pattern
                    </motion.button>
                    {state.bestStreak > 1 && (
                      <p className="text-xs text-stone-600 mt-1">
                        Best streak: {state.bestStreak}
                      </p>
                    )}
                  </motion.div>
                )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
