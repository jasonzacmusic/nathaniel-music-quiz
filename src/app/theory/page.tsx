"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import EraSlider from "@/components/EraSlider";

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

/** Map slider value (0-100) to tradition weights */
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

/** Build category query params from tradition weights */
function getWeightedCategories(sliderValue: number): string {
  const weights = getTraditionWeights(sliderValue);
  const cats: string[] = [];
  for (const [tradition, w] of Object.entries(weights)) {
    if (w > 0.05) {
      const tradCats = TRADITION_CATEGORIES[tradition] || [];
      cats.push(...tradCats);
    }
  }
  // Deduplicate
  return Array.from(new Set(cats)).join(",");
}

/* ── Config ── */

const DIFFICULTY_CONFIG = [
  {
    level: "beginner", label: "Beginner",
    desc: "Key signatures, basic intervals, major & minor scales, simple triads, raga fundamentals.",
    color: "from-emerald-900/30 to-emerald-950/10",
    border: "border-emerald-700/25",
    borderActive: "border-emerald-500/60 ring-1 ring-emerald-500/30",
    badge: "bg-emerald-500/15 text-emerald-400",
  },
  {
    level: "intermediate", label: "Intermediate",
    desc: "Modes, seventh chords, secondary dominants, melakarta system, taal patterns.",
    color: "from-amber-900/25 to-amber-950/10",
    border: "border-amber-700/25",
    borderActive: "border-amber-500/60 ring-1 ring-amber-500/30",
    badge: "bg-amber-500/15 text-amber-400",
  },
  {
    level: "advanced", label: "Advanced",
    desc: "Altered dominants, polytonal harmony, janya ragas, complex tala, Schenkerian analysis.",
    color: "from-red-900/20 to-red-950/10",
    border: "border-red-700/25",
    borderActive: "border-red-500/60 ring-1 ring-red-500/30",
    badge: "bg-red-500/15 text-red-400",
  },
];

interface Stats {
  total_questions: number;
  categories_count: number;
  difficulties: { difficulty: string; count: number }[];
}

interface CategoryInfo {
  category: string;
  count: number;
}

export default function TheoryPage() {
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(12);
  const [stats, setStats] = useState<Stats | null>(null);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/theory")
      .then((r) => r.json())
      .then((d) => {
        setStats(d.stats || null);
        setCategories(d.categories || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const hasQuestions = stats && stats.total_questions > 0;

  /** Build quiz URL with tradition categories */
  function quizUrl(count: number, diff?: string, cat?: string) {
    const params = new URLSearchParams({ count: String(count) });
    if (diff) params.set("difficulty", diff);
    if (cat) {
      params.set("category", cat);
    } else {
      // Use tradition slider categories
      const tradCats = getWeightedCategories(sliderValue);
      if (tradCats) params.set("categories", tradCats);
    }
    return `/theory/quiz?${params}`;
  }

  return (
    <main className="bg-[#0a0a08] text-stone-100 min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(180,83,9,0.12),transparent)]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-[11px] text-amber-600/60 uppercase tracking-[0.2em] font-medium mb-4">
            Nathaniel School of Music
          </p>
          <h1 className="font-display font-700 text-4xl sm:text-5xl md:text-6xl text-white leading-[1.1] mb-4">
            Music Theory
            <span className="block text-amber-400">Quiz</span>
          </h1>
          <p className="text-stone-500 text-lg max-w-xl mx-auto leading-relaxed">
            Western classical to jazz, Carnatic to Hindustani — test your
            knowledge across the world&apos;s music traditions.
          </p>
          {hasQuestions && (
            <div className="mt-8 inline-flex items-center gap-4 text-sm text-stone-600">
              <span>{stats.total_questions} questions</span>
              <span className="w-1 h-1 rounded-full bg-amber-700/50" />
              <span>{stats.categories_count} topics</span>
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : !hasQuestions ? (
        <section className="px-6 pb-24">
          <div className="max-w-2xl mx-auto text-center py-16">
            <p className="text-stone-600 text-lg mb-2">Theory questions coming soon.</p>
            <Link href="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-amber-700 text-white font-display font-700 hover:bg-amber-600 transition-colors">
              Back Home
            </Link>
          </div>
        </section>
      ) : (
        <>
          {/* Step 1: Difficulty */}
          <section className="px-6 pb-10">
            <div className="max-w-4xl mx-auto">
              <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-6">
                Step 1 — Select your level
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DIFFICULTY_CONFIG.map((d) => {
                  const isActive = difficulty === d.level;
                  const diffStats = stats!.difficulties.find((s) => s.difficulty === d.level);
                  const count = diffStats ? diffStats.count : 0;
                  return (
                    <motion.button
                      key={d.level}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setDifficulty(isActive ? null : d.level)}
                      className={`rounded-2xl border p-5 sm:p-6 bg-gradient-to-b ${d.color} ${isActive ? d.borderActive : d.border} transition-all h-full text-left hover:border-white/20`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-600 uppercase tracking-wider ${d.badge} mb-3`}>
                        {d.label}
                      </span>
                      <p className="text-stone-500 text-sm leading-relaxed mb-3">{d.desc}</p>
                      {count > 0 && <p className="text-[11px] text-stone-600">{count} questions</p>}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Step 2: Tradition Slider */}
          <AnimatePresence>
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="px-6 pb-10"
            >
              <div className="max-w-4xl mx-auto">
                <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-6">
                  Step 2 — Choose tradition focus
                </p>
                <EraSlider value={sliderValue} onChange={setSliderValue} />
              </div>
            </motion.section>
          </AnimatePresence>

          {/* Step 3: Start Quiz */}
          <section className="px-6 pb-12">
            <div className="max-w-4xl mx-auto">
              <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-6">
                Step 3 — Pick session length
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { count: 10, label: "Quick 10", color: "border-amber-700/25 hover:border-amber-600/40" },
                  { count: 20, label: "Standard 20", color: "border-violet-700/25 hover:border-violet-600/40" },
                  { count: 30, label: "Deep Dive 30", color: "border-cyan-700/25 hover:border-cyan-600/40" },
                  { count: 50, label: "Marathon 50", color: "border-orange-700/25 hover:border-orange-600/40" },
                ].map((opt) => (
                  <Link key={opt.count} href={quizUrl(opt.count, difficulty || undefined)}>
                    <div className={`rounded-xl border ${opt.color} bg-white/[0.02] p-4 text-center hover:bg-white/[0.05] transition-all`}>
                      <p className="font-display font-700 text-white text-lg">{opt.count}</p>
                      <p className="text-stone-500 text-xs">{opt.label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Browse by Topic */}
          {categories.length > 0 && (
            <section className="px-6 pb-24">
              <div className="max-w-4xl mx-auto">
                <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-6">Or browse by topic</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <Link key={cat.category} href={quizUrl(10, difficulty || undefined, cat.category)}>
                      <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-800/30 transition-all">
                        <span className="font-display font-600 text-sm text-white/80">{cat.category}</span>
                        <span className="text-xs text-stone-600">{cat.count}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
