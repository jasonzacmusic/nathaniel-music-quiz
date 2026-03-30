import { getCategories, getQuizStats } from "@/lib/queries";
import HeroSection from "@/components/HeroSection";
import CategoryCard from "@/components/CategoryCard";
import { LINKS } from "@/config/links";

function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("piano")) return "P";
  if (n.includes("bass")) return "B";
  if (n.includes("chord")) return "C";
  if (n.includes("rhythm")) return "R";
  if (n.includes("scale") || n.includes("mode")) return "M";
  if (n.includes("interval")) return "I";
  if (n.includes("theory")) return "T";
  if (n.includes("composition")) return "W";
  if (n.includes("ear")) return "E";
  if (n.includes("whistle") || n.includes("tin")) return "W";
  return "Q";
}

function getCategoryColor(index: number): string {
  const colors = [
    "from-violet-600 to-purple-500",
    "from-blue-600 to-cyan-500",
    "from-emerald-600 to-teal-500",
    "from-orange-600 to-amber-500",
    "from-pink-600 to-rose-500",
    "from-indigo-600 to-blue-500",
    "from-red-600 to-orange-500",
    "from-purple-600 to-violet-500",
  ];
  return colors[index % colors.length];
}

export const dynamic = "force-dynamic";

export default async function Home() {
  let categories: { category: string; count: number }[] = [];
  let quizStats = { total_questions: 0, total_sets: 0, categories_count: 0 };
  try {
    const [cats, stats] = await Promise.all([getCategories(), getQuizStats()]);
    categories = cats;
    quizStats = stats;
  } catch {
    // DB unavailable — render with empty state
  }

  return (
    <main className="bg-[#080D1A] text-slate-100">
      <HeroSection
        stats={{
          totalQuestions: quizStats.total_questions,
          totalSets: quizStats.total_sets,
          categories: quizStats.categories_count,
        }}
        categories={categories.map((c) => ({ name: c.category, count: c.count }))}
      />

      {/* ── CATEGORIES — left-aligned, two columns ── */}
      <section id="categories" className="py-24 sm:py-32 px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-20 items-start">
            {/* Left — sticky label */}
            <div className="lg:sticky lg:top-28">
              <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-violet-400/60 mb-4">Topics</p>
              <h2 className="font-display font-700 text-3xl sm:text-4xl text-white leading-[1.15] mb-4">
                Pick what to<br />train today.
              </h2>
              <p className="text-white/35 text-base leading-relaxed max-w-sm">
                Chord degrees and jazz extensions. Odd meters from 7/8 to 19/8.
                All 21 modes by ear. Each category draws from real teaching videos.
              </p>
            </div>

            {/* Right — category list */}
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((category, index) => (
                  <CategoryCard
                    key={category.category}
                    name={category.category}
                    questionCount={category.count}
                    icon={getCategoryIcon(category.category)}
                    color={getCategoryColor(index)}
                    href={`/category/${encodeURIComponent(category.category)}`}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-slate-600">
                <p className="text-sm">Categories loading...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — horizontal scroll cards ── */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 mb-12">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-400/50 mb-4">How it works</p>
          <h2 className="font-display font-700 text-3xl sm:text-4xl text-white leading-[1.15]">
            Three steps. Zero theory books.
          </h2>
        </div>

        <div className="flex gap-5 px-6 lg:px-8 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
          {[
            {
              num: "01",
              title: "Listen to the clip",
              desc: "A short excerpt from a real YouTube lesson plays. Unmute, close your eyes if you need to. The mode, the rhythm, the chord colour — it's all in the music.",
              accent: "#8b5cf6",
              bg: "from-violet-500/8 to-transparent",
            },
            {
              num: "02",
              title: "Trust your ear",
              desc: "Four options. Is it Dorian or Mixolydian ♭6? A slash chord or a secondary dominant? 7/8 or 11/8? No theory books — just your ear. Pick one.",
              accent: "#06B6D4",
              bg: "from-cyan-500/8 to-transparent",
            },
            {
              num: "03",
              title: "Learn from the answer",
              desc: "Right or wrong, you see the correct answer instantly. One tap takes you to the full lesson. That moment of understanding builds permanent ear muscle.",
              accent: "#f59e0b",
              bg: "from-amber-500/8 to-transparent",
            },
          ].map((step) => (
            <div
              key={step.num}
              className={`flex-shrink-0 w-[320px] sm:w-[380px] p-7 sm:p-8 rounded-2xl bg-gradient-to-b ${step.bg} border border-white/[0.05]`}
            >
              <div
                className="text-5xl sm:text-6xl font-display font-700 mb-6 leading-none"
                style={{ color: step.accent + "25" }}
              >
                {step.num}
              </div>
              <h3 className="font-display font-700 text-lg text-white mb-3">{step.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
          {/* Spacer for scroll end */}
          <div className="flex-shrink-0 w-6 lg:w-8" />
        </div>
      </section>

      {/* ── SOCIAL PROOF / SHARE — asymmetric layout ── */}
      <section className="py-20 sm:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Challenge card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] p-8 sm:p-10 flex flex-col justify-between min-h-[280px]"
              style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.04) 100%)" }}
            >
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-violet-400/50 mb-4">Challenge a friend</p>
                <h3 className="font-display font-700 text-2xl sm:text-3xl text-white leading-[1.15] mb-3">
                  Know someone who thinks they<br className="hidden sm:block" />
                  know their theory?
                </h3>
                <p className="text-white/30 text-sm leading-relaxed max-w-sm">
                  Send them a quiz and see how they handle secondary dominants, jazz extensions, and odd time signatures.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 mt-8">
                <a
                  href="https://wa.me/?text=Free+advanced+ear+training+quiz+from+Nathaniel+School+of+Music+https://quiz.nathanielschool.com"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a
                  href="https://twitter.com/intent/tweet?text=Just+found+this+free+advanced+ear+training+quiz.+Built+from+real+music+lessons&url=https://quiz.nathanielschool.com"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60 text-sm font-medium hover:bg-white/[0.08] hover:text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Share on X
                </a>
              </div>
            </div>

            {/* Stacked cards: YouTube + Patreon */}
            <div className="flex flex-col gap-6">
              <a
                href={LINKS.youtube}
                target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-red-500/[0.04] hover:border-red-500/15 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0 group-hover:bg-red-500/20 transition-colors">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-700 text-base text-white mb-1">Free YouTube Lessons</h3>
                  <p className="text-white/30 text-sm leading-relaxed">
                    Every quiz question links back to a full lesson. Get one wrong? The explanation is one click away.
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/15 shrink-0 group-hover:text-red-400/50 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>

              <a
                href={LINKS.patreon}
                target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-orange-500/[0.04] hover:border-orange-500/15 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-orange-500/10 border border-orange-500/15 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
                  <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-700 text-base text-white mb-1">Support on Patreon</h3>
                  <p className="text-white/30 text-sm leading-relaxed">
                    New quiz sets weekly. Early access, exclusive deep-dives, and keeping free music education alive.
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/15 shrink-0 group-hover:text-orange-400/50 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>

              <a
                href={LINKS.instagram}
                target="_blank" rel="noopener noreferrer"
                className="group flex items-center gap-5 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-pink-500/[0.04] hover:border-pink-500/15 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-pink-500/10 border border-pink-500/15 flex items-center justify-center shrink-0 group-hover:bg-pink-500/20 transition-colors">
                  <svg className="w-6 h-6 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-700 text-base text-white mb-1">Follow on Instagram</h3>
                  <p className="text-white/30 text-sm leading-relaxed">
                    Behind the scenes, quick tips, and new quiz announcements.
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/15 shrink-0 group-hover:text-pink-400/50 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
