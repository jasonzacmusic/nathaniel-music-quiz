import Link from "next/link";
import { getTheoryCategories, getTheoryStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

const DIFFICULTY_CONFIG = [
  {
    level: "beginner",
    label: "Beginner",
    desc: "Key signatures, basic intervals, major & minor scales, simple triads, raga fundamentals.",
    color: "from-emerald-900/30 to-emerald-950/10",
    border: "border-emerald-700/25 hover:border-emerald-600/40",
    badge: "bg-emerald-500/15 text-emerald-400",
  },
  {
    level: "intermediate",
    label: "Intermediate",
    desc: "Modes, seventh chords, secondary dominants, melakarta system, taal patterns.",
    color: "from-amber-900/25 to-amber-950/10",
    border: "border-amber-700/25 hover:border-amber-600/40",
    badge: "bg-amber-500/15 text-amber-400",
  },
  {
    level: "advanced",
    label: "Advanced",
    desc: "Altered dominants, polytonal harmony, janya ragas, complex tala, Schenkerian analysis.",
    color: "from-red-900/20 to-red-950/10",
    border: "border-red-700/25 hover:border-red-600/40",
    badge: "bg-red-500/15 text-red-400",
  },
];

export default async function TheoryPage() {
  let categories: { category: string; count: number }[] = [];
  let stats = { total_questions: 0, categories_count: 0, difficulties: [] as { difficulty: string; count: number }[] };

  try {
    [categories, stats] = await Promise.all([getTheoryCategories(), getTheoryStats()]);
  } catch {
    // DB unavailable
  }

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

      {/* Quick Start */}
      {hasQuestions && (
        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <Link href="/theory/quiz?count=10" className="block group">
              <div className="rounded-2xl border border-amber-700/25 bg-gradient-to-r from-amber-900/15 to-transparent p-6 sm:p-8 hover:border-amber-600/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-amber-600/60 uppercase tracking-[0.15em] font-medium mb-2">Quick start</p>
                    <h2 className="font-display font-700 text-xl sm:text-2xl text-white mb-1">10 Random Questions</h2>
                    <p className="text-stone-500 text-sm">All difficulties, all topics. Jump right in.</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-700/20 border border-amber-600/30 flex items-center justify-center group-hover:bg-amber-700/30 transition-colors">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Difficulty Levels */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-6">By difficulty</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DIFFICULTY_CONFIG.map((d) => {
              const diffStats = stats.difficulties.find((s) => s.difficulty === d.level);
              const count = diffStats ? diffStats.count : 0;
              return (
                <Link key={d.level} href={`/theory/quiz?difficulty=${d.level}&count=10`}>
                  <div className={`rounded-2xl border p-5 sm:p-6 bg-gradient-to-b ${d.color} ${d.border} transition-all h-full`}>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-600 uppercase tracking-wider ${d.badge} mb-3`}>
                      {d.label}
                    </span>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">{d.desc}</p>
                    {count > 0 && <p className="text-[11px] text-stone-600">{count} questions</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quiz Size Options */}
      {hasQuestions && (
        <section className="px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-6">By session length</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { count: 10, label: "Quick 10", color: "border-amber-700/25 hover:border-amber-600/40" },
                { count: 20, label: "Standard 20", color: "border-violet-700/25 hover:border-violet-600/40" },
                { count: 30, label: "Deep Dive 30", color: "border-cyan-700/25 hover:border-cyan-600/40" },
                { count: 50, label: "Marathon 50", color: "border-orange-700/25 hover:border-orange-600/40" },
              ].map((opt) => (
                <Link key={opt.count} href={`/theory/quiz?count=${opt.count}`}>
                  <div className={`rounded-xl border ${opt.color} bg-white/[0.02] p-4 text-center hover:bg-white/[0.05] transition-all`}>
                    <p className="font-display font-700 text-white text-lg">{opt.count}</p>
                    <p className="text-stone-500 text-xs">{opt.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <p className="text-[11px] text-amber-600/50 uppercase tracking-[0.2em] font-medium mb-6">By topic</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <Link key={cat.category} href={`/theory/quiz?category=${encodeURIComponent(cat.category)}&count=10`}>
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

      {/* Empty state */}
      {!hasQuestions && (
        <section className="px-6 pb-24">
          <div className="max-w-2xl mx-auto text-center py-16">
            <p className="text-stone-600 text-lg mb-2">Theory questions coming soon.</p>
            <p className="text-stone-700 text-sm">We&apos;re building a library of music theory questions.</p>
            <Link href="/" className="inline-block mt-6 px-6 py-3 rounded-xl bg-amber-700 text-white font-display font-700 hover:bg-amber-600 transition-colors">
              Back Home
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
