"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, TrendingDown, Minus, ArrowRight, BookOpen } from "lucide-react";
import EraSlider from "@/components/EraSlider";
import { loadStats, getTheoryProgress, getPathProgress } from "@/lib/gamification";
import { LEARNING_PATHS } from "@/config/learning-paths";

/* ── Tradition → category mapping ── */

const TRADITION_CATEGORIES: Record<string, string[]> = {
  western: [
    "Key Signatures", "Intervals", "Scales & Modes", "Chord Theory",
    "Rhythm & Meter", "Notation", "Form & Analysis", "Harmony & Voice Leading",
  ],
  jazz: ["Jazz Theory"],
  carnatic: [
    "Carnatic Ragas", "Carnatic Tala", "Carnatic Compositions",
    "Carnatic Theory", "Indian Classical Theory",
  ],
  hindustani: [
    "Hindustani Theory", "Hindustani Ragas", "Hindustani Tala",
    "Hindustani Compositions", "Indian Classical Theory",
  ],
};

function getTraditionWeights(sliderValue: number) {
  const zones = [
    { name: "western", center: 12.5 },
    { name: "jazz", center: 37.5 },
    { name: "carnatic", center: 62.5 },
    { name: "hindustani", center: 87.5 },
  ];
  const weights: Record<string, number> = {};
  let total = 0;
  for (const z of zones) {
    const dist = Math.abs(sliderValue - z.center);
    const w = Math.max(0, 1 - dist / 35);
    weights[z.name] = w;
    total += w;
  }
  if (total > 0) for (const k of Object.keys(weights)) weights[k] /= total;
  return weights;
}

function getWeightedCategoryParams(sliderValue: number, totalCount: number): { categories: string; counts: string } {
  const weights = getTraditionWeights(sliderValue);
  const activeTraditions = Object.entries(weights).filter(([, w]) => w > 0.05);
  const allCats: string[] = [];
  const allCounts: number[] = [];
  let assigned = 0;
  for (let i = 0; i < activeTraditions.length; i++) {
    const [tradition, w] = activeTraditions[i];
    const tradCats = TRADITION_CATEGORIES[tradition] || [];
    const count = i === activeTraditions.length - 1 ? totalCount - assigned : Math.round(w * totalCount);
    assigned += count;
    if (count > 0 && tradCats.length > 0) {
      allCats.push(...tradCats);
      tradCats.forEach(() => allCounts.push(count));
    }
  }
  const catMap = new Map<string, number>();
  for (let i = 0; i < allCats.length; i++) {
    catMap.set(allCats[i], Math.max(catMap.get(allCats[i]) || 0, allCounts[i]));
  }
  return { categories: Array.from(catMap.keys()).join(","), counts: Array.from(catMap.values()).join(",") };
}

/* ── Quick-start presets ── */

const PRESETS = [
  { label: "Western Beginner", count: 10, difficulty: "beginner", slider: 12, color: "border-amber-500/25 bg-amber-500/[0.06] hover:bg-amber-500/[0.12] text-amber-300" },
  { label: "Jazz Deep Dive", count: 30, difficulty: "intermediate", slider: 37, color: "border-violet-500/25 bg-violet-500/[0.06] hover:bg-violet-500/[0.12] text-violet-300" },
  { label: "Carnatic Essentials", count: 15, difficulty: "beginner", slider: 62, color: "border-orange-500/25 bg-orange-500/[0.06] hover:bg-orange-500/[0.12] text-orange-300" },
  { label: "Full Mix", count: 20, difficulty: "", slider: 50, color: "border-cyan-500/25 bg-cyan-500/[0.06] hover:bg-cyan-500/[0.12] text-cyan-300" },
];

const DIFFICULTY_OPTIONS = [
  { value: null, label: "All Levels", color: "from-white/10 to-white/5", border: "border-white/20", activeBorder: "border-white/50" },
  { value: "beginner", label: "Beginner", color: "from-emerald-500/20 to-green-500/10", border: "border-emerald-500/20", activeBorder: "border-emerald-400/60" },
  { value: "intermediate", label: "Intermediate", color: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/20", activeBorder: "border-amber-400/60" },
  { value: "advanced", label: "Advanced", color: "from-rose-500/20 to-purple-500/10", border: "border-rose-500/20", activeBorder: "border-rose-400/60" },
];

const COUNT_OPTIONS = [10, 20, 30, 50];

interface Stats { total_questions: number; categories_count: number; difficulties: { difficulty: string; count: number }[] }
interface CategoryInfo { category: string; count: number }

export default function TheoryPage() {
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(12);
  const [questionCount, setQuestionCount] = useState(20);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ReturnType<typeof getTheoryProgress>>(null);

  useEffect(() => {
    fetch("/api/theory")
      .then((r) => r.json())
      .then((d) => { setStats(d.stats || null); setCategories(d.categories || []); setLoading(false); })
      .catch(() => setLoading(false));

    // Load progress from localStorage
    const playerStats = loadStats();
    setProgress(getTheoryProgress(playerStats));
  }, []);

  const hasQuestions = stats && stats.total_questions > 0;

  function quizUrl(count: number, diff?: string, cat?: string) {
    const params = new URLSearchParams({ count: String(count) });
    if (diff) params.set("difficulty", diff);
    if (cat) {
      params.set("category", cat);
    } else {
      params.set("slider", String(sliderValue));
      const { categories: tradCats } = getWeightedCategoryParams(sliderValue, count);
      if (tradCats) params.set("categories", tradCats);
    }
    return `/theory/quiz?${params}`;
  }

  function pathStepUrl(path: typeof LEARNING_PATHS[0], stepIndex: number) {
    const step = path.steps[stepIndex];
    const params = new URLSearchParams({
      count: String(step.count),
      difficulty: path.difficulty,
      category: step.category,
      pathId: path.id,
      step: String(stepIndex),
    });
    return `/theory/quiz?${params}`;
  }

  function presetUrl(preset: typeof PRESETS[0]) {
    const params = new URLSearchParams({ count: String(preset.count) });
    if (preset.difficulty) params.set("difficulty", preset.difficulty);
    params.set("slider", String(preset.slider));
    const { categories: tradCats } = getWeightedCategoryParams(preset.slider, preset.count);
    if (tradCats) params.set("categories", tradCats);
    return `/theory/quiz?${params}`;
  }

  return (
    <main className="bg-[#0a0a08] text-stone-100 min-h-screen">
      {/* Hero — compact */}
      <section className="relative pt-24 pb-10 sm:pt-28 sm:pb-12 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(180,83,9,0.12),transparent)]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[11px] text-amber-600/60 uppercase tracking-[0.2em] font-medium mb-3">Nathaniel School of Music</p>
          <h1 className="font-display font-700 text-3xl sm:text-4xl md:text-5xl text-white leading-[1.1] mb-3">
            Music Theory <span className="text-amber-400">Quiz</span>
          </h1>
          <p className="text-stone-500 text-base max-w-lg mx-auto">
            Western, jazz, Carnatic, Hindustani — test and grow your theory knowledge.
          </p>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-400 animate-spin" /></div>
      ) : !hasQuestions ? (
        <section className="px-6 pb-24">
          <div className="max-w-2xl mx-auto text-center py-16">
            <p className="text-stone-600 text-lg mb-2">Theory questions coming soon.</p>
            <Link href="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-amber-700 text-white font-display font-700">Back Home</Link>
          </div>
        </section>
      ) : (
        <div className="max-w-4xl mx-auto px-6 pb-24 space-y-10">

          {/* ═══ Your Progress ═══ */}
          {progress && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] p-5">
                <h2 className="font-display font-700 text-sm text-amber-400 mb-4 uppercase tracking-wider">Your Progress</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-2xl font-display font-700 text-white">{progress.overallAccuracy}%</span>
                      {progress.recentTrend === "up" && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                      {progress.recentTrend === "down" && <TrendingDown className="w-4 h-4 text-rose-400" />}
                      {progress.recentTrend === "stable" && <Minus className="w-4 h-4 text-stone-500" />}
                    </div>
                    <p className="text-[10px] text-stone-500 uppercase mt-1">Accuracy</p>
                  </div>
                  <div className="text-center">
                    <span className="text-2xl font-display font-700 text-white">{progress.sessionsThisWeek}</span>
                    <p className="text-[10px] text-stone-500 uppercase mt-1">This Week</p>
                  </div>
                  <div className="col-span-2">
                    {progress.weakestCategories.length > 0 && (
                      <div>
                        <p className="text-[10px] text-stone-500 uppercase mb-2">Focus Areas</p>
                        <div className="flex flex-wrap gap-1.5">
                          {progress.weakestCategories.map(wc => (
                            <Link key={wc.category} href={quizUrl(10, difficulty || undefined, wc.category)}
                              className="px-2.5 py-1 rounded-full text-[10px] font-600 border border-rose-500/20 bg-rose-500/[0.06] text-rose-300 hover:bg-rose-500/[0.12] transition-all">
                              {wc.category} ({wc.accuracy}%)
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                    {progress.suggestedFocus && (
                      <Link href={quizUrl(10, difficulty || undefined, progress.suggestedFocus)}
                        className="inline-flex items-center gap-1.5 mt-2 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                        Practice {progress.suggestedFocus} <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ═══ Quick Start Presets ═══ */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 className="font-display font-700 text-sm text-stone-400 mb-3 uppercase tracking-wider">Quick Start</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESETS.map(preset => (
                <Link key={preset.label} href={presetUrl(preset)}>
                  <div className={`p-3.5 rounded-xl border ${preset.color} text-center transition-all hover:scale-[1.03]`}>
                    <p className="font-display font-700 text-sm">{preset.label}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">{preset.count} questions</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* ═══ Learning Paths ═══ */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-display font-700 text-sm text-stone-400 mb-3 uppercase tracking-wider">Learning Paths</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LEARNING_PATHS.map(path => {
                const pathProg = getPathProgress(path.id);
                const completedCount = pathProg?.completedSteps.length || 0;
                const totalSteps = path.steps.length;
                const progressPct = Math.round((completedCount / totalSteps) * 100);
                const nextStep = path.steps.findIndex((_, i) => !pathProg?.completedSteps.includes(i));
                const nextStepIdx = nextStep === -1 ? 0 : nextStep;
                const isComplete = completedCount >= totalSteps;

                const colorMap: Record<string, string> = {
                  amber: "border-amber-500/20 hover:border-amber-500/40",
                  violet: "border-violet-500/20 hover:border-violet-500/40",
                  orange: "border-orange-500/20 hover:border-orange-500/40",
                  indigo: "border-indigo-500/20 hover:border-indigo-500/40",
                  rose: "border-rose-500/20 hover:border-rose-500/40",
                };
                const diffBadge: Record<string, string> = {
                  beginner: "bg-emerald-500/15 text-emerald-400",
                  intermediate: "bg-amber-500/15 text-amber-400",
                  advanced: "bg-rose-500/15 text-rose-400",
                };

                return (
                  <Link key={path.id} href={isComplete ? quizUrl(10, path.difficulty, path.steps[0].category) : pathStepUrl(path, nextStepIdx)}>
                    <div className={`rounded-xl border ${colorMap[path.color] || colorMap.amber} bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-all h-full`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{path.icon}</span>
                          <div>
                            <h3 className="font-display font-700 text-sm text-white">{path.name}</h3>
                            <p className="text-[10px] text-stone-500">{path.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-600 uppercase ${diffBadge[path.difficulty] || diffBadge.beginner}`}>
                          {path.difficulty}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-[10px] text-stone-600 mb-1">
                          <span>{completedCount}/{totalSteps} steps</span>
                          <span>{isComplete ? "Complete!" : `${progressPct}%`}</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                            style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.section>

          {/* ═══ Custom Quiz Builder ═══ */}
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h2 className="font-display font-700 text-sm text-stone-400 mb-4 uppercase tracking-wider">Build Your Quiz</h2>

            {/* Difficulty */}
            <div className="mb-4">
              <p className="text-[10px] text-stone-600 uppercase tracking-wider mb-2">Difficulty</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DIFFICULTY_OPTIONS.map(d => {
                  const isActive = difficulty === d.value;
                  return (
                    <button key={d.label} onClick={() => setDifficulty(d.value)}
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${d.color} border ${isActive ? d.activeBorder + " ring-1 ring-white/10" : d.border} text-center transition-all hover:scale-[1.03]`}>
                      <span className={`font-display font-700 text-xs ${isActive ? "text-white" : "text-white/60"}`}>{d.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tradition Slider */}
            <div className="mb-4">
              <p className="text-[10px] text-stone-600 uppercase tracking-wider mb-2">Tradition Focus</p>
              <EraSlider value={sliderValue} onChange={setSliderValue} />
            </div>

            {/* Count + Start */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1">
                {COUNT_OPTIONS.map(c => (
                  <button key={c} onClick={() => setQuestionCount(c)}
                    className={`px-3 py-2 rounded-lg text-sm font-display font-700 transition-all ${
                      questionCount === c ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-stone-500 hover:text-white"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
              <Link href={quizUrl(questionCount, difficulty || undefined)} className="flex-1">
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl font-display font-700 text-base text-white transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg, #b45309, #92400e)", boxShadow: "0 0 20px rgba(180,83,9,0.2)" }}>
                  <BookOpen className="w-4 h-4" />
                  Start Quiz
                </div>
              </Link>
            </div>
          </motion.section>

          {/* ═══ Browse by Topic ═══ */}
          {categories.length > 0 && (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="font-display font-700 text-sm text-stone-400 mb-3 uppercase tracking-wider">Browse by Topic</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {categories.map(cat => (
                  <Link key={cat.category} href={quizUrl(10, difficulty || undefined, cat.category)}>
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-800/30 transition-all">
                      <span className="font-display font-600 text-sm text-white/80">{cat.category}</span>
                      <span className="text-xs text-stone-600">{cat.count}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      )}
    </main>
  );
}
