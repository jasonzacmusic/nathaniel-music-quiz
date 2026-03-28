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
  const [categories, quizStats] = await Promise.all([
    getCategories(),
    getQuizStats(),
  ]);

  return (
    <main className="bg-dark-bg text-slate-100">
      <HeroSection
        stats={{
          totalQuestions: quizStats.total_questions,
          totalSets: quizStats.total_sets,
          categories: quizStats.categories_count,
        }}
      />

      {/* Categories Section */}
      <section
        id="categories"
        className="py-24 px-4 sm:px-6 lg:px-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="font-display font-700 text-3xl md:text-5xl mb-4">
              <span className="text-white">Pick a </span>
              <span className="bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                Category
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              Choose what you want to master and start training
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.category}
                name={category.category}
                questionCount={category.count}
                icon={getCategoryIcon(category.category)}
                color={getCategoryColor(index)}
                href={`/category/${encodeURIComponent(category.category)}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Learn With Us Section - YouTube & Patreon */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="font-display font-700 text-3xl md:text-5xl mb-4">
              <span className="text-white">Learn </span>
              <span className="bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
                With Us
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-lg mx-auto">
              These quizzes are based on our YouTube lessons. Watch, learn, then test yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* YouTube Card */}
            <a
              href={LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <h3 className="font-display font-700 text-xl text-white">YouTube Lessons</h3>
                </div>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Free video lessons on ear training, chord progressions, rhythm, and more. Every quiz question comes from a real lesson.
                </p>
                <span className="inline-flex items-center gap-2 text-red-400 font-medium text-sm group-hover:gap-3 transition-all">
                  Watch on YouTube
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </a>

            {/* Patreon Card */}
            <a
              href={LINKS.patreon}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all duration-500"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-colors duration-500" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.386.524c-4.764 0-8.64 3.876-8.64 8.64 0 4.75 3.876 8.613 8.64 8.613 4.75 0 8.614-3.864 8.614-8.613C24 4.4 20.136.524 15.386.524M.003 23.537h4.22V.524H.003"/>
                  </svg>
                  <h3 className="font-display font-700 text-xl text-white">Support on Patreon</h3>
                </div>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Get exclusive content, early access to new quizzes, and support the creation of free music education.
                </p>
                <span className="inline-flex items-center gap-2 text-orange-400 font-medium text-sm group-hover:gap-3 transition-all">
                  Join Patreon
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* About Section - Minimal */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-slate-500 text-sm leading-relaxed">
            Built by{" "}
            <a
              href={LINKS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/20"
            >
              Nathaniel School of Music
            </a>{" "}
            — music education reimagined through interactive quizzes based on real lessons from our{" "}
            <a
              href={LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors underline underline-offset-4 decoration-white/20"
            >
              YouTube channel
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
