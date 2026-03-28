import { getCategories, getQuizStats } from "@/lib/queries";
import HeroSection from "@/components/HeroSection";
import CategoryCard from "@/components/CategoryCard";
import { LINKS } from "@/config/links";

function getCategoryIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("piano")) return "🎹";
  if (n.includes("bass")) return "🎸";
  if (n.includes("chord")) return "🎵";
  if (n.includes("rhythm")) return "🥁";
  if (n.includes("scale") || n.includes("mode")) return "🎼";
  if (n.includes("interval")) return "🎯";
  if (n.includes("theory")) return "📖";
  if (n.includes("composition")) return "✍️";
  if (n.includes("ear")) return "👂";
  return "🎵";
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
      />

      {/* ── CATEGORIES ── */}
      <section id="categories" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(124,58,237,0.04),transparent)]" />
        <div className="max-w-6xl mx-auto relative">

          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.05] mb-5">
              <span className="text-[10px] text-violet-400 font-medium uppercase tracking-[0.14em]">Pick a topic and test your ears</span>
            </div>
            <h2 className="font-display font-700 text-4xl md:text-5xl mb-4 leading-tight">
              <span className="text-white">Where are your ears </span>
              <span style={{
                background: "linear-gradient(135deg, #c4b5fd, #8b5cf6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                strong?
              </span>
            </h2>
            <p className="text-slate-400 text-base max-w-md mx-auto">
              Chord degrees and jazz extensions. Odd meters from 7/8 to 19/8. All 21 modes by ear. Each category draws from real teaching videos — pick the one that challenges you most.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="font-display font-700 text-3xl md:text-5xl mb-4 text-white">
              How It Works
            </h2>
            <p className="text-slate-400 text-base max-w-sm mx-auto">
              Each session takes minutes. The ear training takes root over days.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                icon: "▶️",
                title: "Watch the clip — really listen",
                desc: "A short excerpt from a real YouTube lesson plays. Unmute, close your eyes if you need to. The mode, the rhythm, the chord colour — it's all in there.",
                color: "from-violet-500/15 to-purple-500/5",
                border: "border-violet-500/20",
                accent: "#8b5cf6",
              },
              {
                step: "02",
                icon: "👂",
                title: "Commit to an answer",
                desc: "Four options. Is it Dorian or Mixolydian ♭6? A slash chord or a secondary dominant? 7/8 or 11/8? No theory books — just your ear. Pick one.",
                color: "from-cyan-500/15 to-blue-500/5",
                border: "border-cyan-500/20",
                accent: "#06B6D4",
              },
              {
                step: "03",
                icon: "🔥",
                title: "See why — then go again",
                desc: "Right or wrong, you see the correct answer and can go straight back to the full lesson. That moment of understanding is what builds permanent ear muscle.",
                color: "from-amber-500/15 to-orange-500/5",
                border: "border-amber-500/20",
                accent: "#F59E0B",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative p-7 rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} backdrop-blur-sm`}
              >
                <div
                  className="text-xs font-display font-700 tracking-widest mb-4 uppercase"
                  style={{ color: item.accent + "80" }}
                >
                  {item.step}
                </div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-display font-700 text-base text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHARE ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 text-center">
            <div className="text-3xl mb-4">🎵</div>
            <h3 className="font-display font-700 text-xl text-white mb-3">
              Know a musician who thinks they know their theory?
            </h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              Send them the Chord Progressions quiz and see how they handle secondary dominants and jazz extensions. Free, no sign-up.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="https://twitter.com/intent/tweet?text=Just+found+this+free+ear+training+quiz+%F0%9F%8E%B5+Built+from+real+music+lessons&url=https://quiz.nathanielschool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Share on X
              </a>
              <a
                href="https://wa.me/?text=Free+ear+training+quiz+from+Nathaniel+School+of+Music+%F0%9F%8E%B5+https://quiz.nathanielschool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-green-400 hover:border-green-500/20 text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share on WhatsApp
              </a>
              <a
                href={LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 hover:text-pink-400 hover:border-pink-500/20 text-sm font-medium transition-all"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── GO DEEPER ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-14">
            <h2 className="font-display font-700 text-3xl md:text-5xl mb-4">
              <span className="text-white">Go </span>
              <span style={{
                background: "linear-gradient(135deg, #fca5a5, #f87171, #fbbf24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Deeper
              </span>
            </h2>
            <p className="text-slate-400 text-base max-w-md mx-auto">
              Every question in this quiz has a full lesson behind it. When you get one wrong, the explanation is one click away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <a
              href={LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 hover:border-red-500/25 hover:bg-red-500/[0.03] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-red-500/15 transition-colors duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <h3 className="font-display font-700 text-lg text-white">Free YouTube Lessons</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Got a question wrong? Find the full lesson — <em>All Minor Scales Explained</em>, <em>Odd Time Signatures</em>, <em>Jazz Extensions</em>, <em>Chord Trees</em> — and see exactly why the answer is what it is. Free, forever.
                </p>
                <span className="inline-flex items-center gap-2 text-red-400 font-medium text-sm group-hover:gap-3 transition-all">
                  Watch the Lessons
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </a>

            <a
              href={LINKS.patreon}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 hover:border-orange-500/25 hover:bg-orange-500/[0.03] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-orange-500/15 transition-colors duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003"/>
                    </svg>
                  </div>
                  <h3 className="font-display font-700 text-lg text-white">Support on Patreon</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  New quiz sets drop weekly. Patreon members get early access, exclusive deep-dive lessons, and the satisfaction of keeping free music education alive for everyone else.
                </p>
                <span className="inline-flex items-center gap-2 text-orange-400 font-medium text-sm group-hover:gap-3 transition-all">
                  Join on Patreon
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section className="py-10 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-slate-600 text-xs leading-relaxed">
            Made with care by{" "}
            <a href={LINKS.website} target="_blank" rel="noopener noreferrer"
              className="text-slate-500 hover:text-white transition-colors underline underline-offset-4 decoration-white/10">
              Nathaniel School of Music
            </a>
            {" "}— music education reimagined through quizzes built on real lessons.
          </p>
        </div>
      </section>
    </main>
  );
}
