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
  let categories: { category: string; count: number; }[] = [];
  let quizStats = { total_questions: 0, total_sets: 0, categories_count: 0 };
  try {
    const [cats, stats] = await Promise.all([getCategories(), getQuizStats()]);
    categories = cats;
    quizStats = stats;
  } catch {
    // DB not available yet — render with empty data
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

      {/* Categories Section */}
      <section id="categories" className="py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,rgba(124,58,237,0.04),transparent)]" />
        <div className="max-w-6xl mx-auto relative">

          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.05] mb-5">
              <span className="text-[10px] text-violet-400 font-medium uppercase tracking-[0.14em]">What do you want to master?</span>
            </div>
            <h2 className="font-display font-700 text-4xl md:text-6xl mb-4 leading-tight">
              <span className="text-white">Pick a </span>
              <span style={{
                background: "linear-gradient(135deg, #c4b5fd, #8b5cf6, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Category
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-sm mx-auto">
              Every topic is built from real lessons. Pick one and start.
            </p>
          </div>

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
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/5 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="font-display font-700 text-3xl md:text-5xl mb-4 text-white">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Three steps from beginner to confident musician
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: "👀",
                title: "Watch the Lesson",
                desc: "Start with a real YouTube lesson. Every question in the quiz comes directly from actual teaching — not made-up examples.",
                color: "from-violet-500/20 to-purple-500/5",
                border: "border-violet-500/20",
              },
              {
                step: "02",
                icon: "👂",
                title: "Listen & Answer",
                desc: "A short video clip plays. Listen carefully — then pick the right answer from the options. No guessing, just your ears.",
                color: "from-cyan-500/20 to-blue-500/5",
                border: "border-cyan-500/20",
              },
              {
                step: "03",
                icon: "🔥",
                title: "Build Your Streak",
                desc: "Track your score, build streaks, and see your accuracy improve. The more you practice, the sharper your ear gets.",
                color: "from-amber-500/20 to-orange-500/5",
                border: "border-amber-500/20",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`relative p-6 rounded-2xl bg-gradient-to-br ${item.color} border ${item.border} backdrop-blur-sm`}
              >
                <div className="text-xs font-display font-700 text-slate-600 tracking-widest mb-4 uppercase">{item.step}</div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-display font-700 text-lg text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learn With Us */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
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
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              These quizzes are just the start. The full lessons live on YouTube — free, always.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* YouTube Card */}
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
                  <h3 className="font-display font-700 text-lg text-white">YouTube Lessons</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Free video lessons on ear training, chord progressions, rhythm, and more. Every quiz question comes from a real lesson you can rewatch anytime.
                </p>
                <span className="inline-flex items-center gap-2 text-red-400 font-medium text-sm group-hover:gap-3 transition-all">
                  Watch Free Lessons
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </a>

            {/* Patreon Card */}
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
                  Get early access to new quizzes, exclusive lessons, and directly support free music education for students everywhere.
                </p>
                <span className="inline-flex items-center gap-2 text-orange-400 font-medium text-sm group-hover:gap-3 transition-all">
                  Join the Community
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Footer note */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-600 text-xs leading-relaxed">
            Built by{" "}
            <a href={LINKS.website} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors underline underline-offset-4 decoration-white/10">
              Nathaniel School of Music
            </a>
            {" "}— music education reimagined through interactive quizzes built on real lessons.
          </p>
        </div>
      </section>
    </main>
  );
}
