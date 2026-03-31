"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EraSlider from "@/components/EraSlider";

const DIFFICULTY_CONFIG = [
  {
    level: "beginner",
    label: "Beginner",
    desc: "Key signatures, basic intervals, major & minor scales, simple triads, raga fundamentals.",
    color: "from-emerald-900/30 to-emerald-950/10",
    border: "border-emerald-700/25 hover:border-emerald-600/40",
    badge: "bg-emerald-500/15 text-emerald-400",
    iconColor: "text-emerald-400",
  },
  {
    level: "intermediate",
    label: "Intermediate",
    desc: "Modes, seventh chords, secondary dominants, compound meters, melakarta system, taal patterns.",
    color: "from-amber-900/25 to-amber-950/10",
    border: "border-amber-700/25 hover:border-amber-600/40",
    badge: "bg-amber-500/15 text-amber-400",
    iconColor: "text-amber-400",
  },
  {
    level: "advanced",
    label: "Advanced",
    desc: "Altered dominants, polytonal harmony, janya ragas, complex tala, Schenkerian analysis, gharana styles.",
    color: "from-red-900/20 to-red-950/10",
    border: "border-red-700/25 hover:border-red-600/40",
    badge: "bg-red-500/15 text-red-400",
    iconColor: "text-red-400",
  },
];

interface TheoryStats {
  total_questions: number;
  categories_count: number;
  difficulties: { difficulty: string; count: number }[];
}

interface Category {
  category: string;
  count: number;
}

function buildQuizUrl(
  basePath: string,
  params: Record<string, string | number | undefined>,
  era: number
) {
  const searchParams = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined) searchParams.set(key, String(val));
  }
  if (era !== 50) {
    searchParams.set("era", String(era));
  }
  return `${basePath}?${searchParams.toString()}`;
}

export default function TheoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<TheoryStats>({
    total_questions: 0,
    categories_count: 0,
    difficulties: [],
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [era, setEra] = useState(50);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/theory")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories || []);
          setStats(
            data.stats || { total_questions: 0, categories_count: 0, difficulties: [] }
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const hasQuestions = stats.total_questions > 0;

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

      {/* ═══ STEP 1: Choose Difficulty ═══ */}
      <section className="px-6 pb-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-600/30 flex items-center justify-center">
              <span className="font-display font-700 text-amber-400 text-sm">1</span>
            </div>
            <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium">
              Choose your level
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DIFFICULTY_CONFIG.map((d) => {
              const diffStats = stats.difficulties.find((s) => s.difficulty === d.level);
              const count = diffStats ? diffStats.count : 0;
              const isSelected = selectedDifficulty === d.level;

              return (
                <motion.button
                  key={d.level}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDifficulty(isSelected ? null : d.level)}
                  className={`rounded-2xl border p-5 sm:p-6 bg-gradient-to-b ${d.color} transition-all h-full text-left ${
                    isSelected
                      ? `${d.border.split(" ")[0]} ring-2 ring-offset-1 ring-offset-[#0a0a08] ${
                          d.level === "beginner" ? "ring-emerald-500/50" :
                          d.level === "intermediate" ? "ring-amber-500/50" :
                          "ring-red-500/50"
                        }`
                      : `${d.border}`
                  }`}
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-600 uppercase tracking-wider ${d.badge} mb-3`}>
                    {d.label}
                  </span>
                  <p className="text-stone-500 text-sm leading-relaxed mb-3">{d.desc}</p>
                  {count > 0 && (
                    <p className="text-[11px] text-stone-600">{count} questions</p>
                  )}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`mt-2 inline-flex items-center gap-1 text-xs font-600 ${d.iconColor}`}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Selected
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ STEP 2: Tradition Slider (appears after choosing difficulty) ═══ */}
      <AnimatePresence>
        {selectedDifficulty && (
          <motion.section
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="px-6 pb-10 overflow-hidden"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-600/30 flex items-center justify-center">
                  <span className="font-display font-700 text-amber-400 text-sm">2</span>
                </div>
                <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium">
                  Choose your tradition
                </p>
              </div>
              <EraSlider value={era} onChange={setEra} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ═══ STEP 3: Start Quiz (appears after both are chosen) ═══ */}
      <AnimatePresence>
        {selectedDifficulty && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="px-6 pb-16"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-600/30 flex items-center justify-center">
                  <span className="font-display font-700 text-amber-400 text-sm">3</span>
                </div>
                <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium">
                  Start your quiz
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Quick 10 */}
                <Link
                  href={buildQuizUrl("/theory/quiz", { difficulty: selectedDifficulty, count: 10 }, era)}
                  className="group block"
                >
                  <div className="rounded-2xl border border-amber-700/25 bg-gradient-to-r from-amber-900/15 to-transparent p-6 hover:border-amber-600/40 transition-all h-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-700 text-lg text-white mb-1">Quick 10</h3>
                        <p className="text-stone-500 text-sm">Fast round, 10 questions</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-700/20 border border-amber-600/30 flex items-center justify-center group-hover:bg-amber-700/30 transition-colors">
                        <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Standard 20 */}
                <Link
                  href={buildQuizUrl("/theory/quiz", { difficulty: selectedDifficulty, count: 20 }, era)}
                  className="group block"
                >
                  <div className="rounded-2xl border border-violet-700/25 bg-gradient-to-r from-violet-900/15 to-transparent p-6 hover:border-violet-600/40 transition-all h-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-700 text-lg text-white mb-1">Standard 20</h3>
                        <p className="text-stone-500 text-sm">Full session, 20 questions</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-violet-700/20 border border-violet-600/30 flex items-center justify-center group-hover:bg-violet-700/30 transition-colors">
                        <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Deep 30 */}
                <Link
                  href={buildQuizUrl("/theory/quiz", { difficulty: selectedDifficulty, count: 30 }, era)}
                  className="group block"
                >
                  <div className="rounded-2xl border border-cyan-700/25 bg-gradient-to-r from-cyan-900/15 to-transparent p-6 hover:border-cyan-600/40 transition-all h-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-700 text-lg text-white mb-1">Deep Dive 30</h3>
                        <p className="text-stone-500 text-sm">Comprehensive, 30 questions</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-cyan-700/20 border border-cyan-600/30 flex items-center justify-center group-hover:bg-cyan-700/30 transition-colors">
                        <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* All questions */}
                <Link
                  href={buildQuizUrl("/theory/quiz", { difficulty: selectedDifficulty, count: 50 }, era)}
                  className="group block"
                >
                  <div className="rounded-2xl border border-orange-700/25 bg-gradient-to-r from-orange-900/15 to-transparent p-6 hover:border-orange-600/40 transition-all h-full">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-700 text-lg text-white mb-1">Marathon 50</h3>
                        <p className="text-stone-500 text-sm">Ultimate challenge</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-orange-700/20 border border-orange-600/30 flex items-center justify-center group-hover:bg-orange-700/30 transition-colors">
                        <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Browse by topic — always visible */}
      {categories.length > 0 && (
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-6">
              Or browse by topic
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.category}
                  href={buildQuizUrl(
                    "/theory/quiz",
                    { category: cat.category, count: 10 },
                    era
                  )}
                >
                  <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber-800/30 transition-all">
                    <span className="font-display font-600 text-sm text-white/80">
                      {cat.category}
                    </span>
                    <span className="text-xs text-stone-600">{cat.count}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state */}
      {loaded && !hasQuestions && (
        <section className="px-6 pb-24">
          <div className="max-w-2xl mx-auto text-center py-16">
            <p className="text-stone-600 text-lg mb-2">Theory questions coming soon.</p>
            <p className="text-stone-700 text-sm">
              We&apos;re building a library of music theory questions from real textbooks.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 rounded-xl bg-amber-700 text-white font-display font-700 hover:bg-amber-600 transition-colors"
            >
              Back Home
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
