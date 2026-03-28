import { getCategories, getAllSets, getQuizStats } from "@/lib/queries";
import HeroSection from "@/components/HeroSection";
import QuickPlay from "@/components/QuickPlay";
import CategoryCard from "@/components/CategoryCard";
import Link from "next/link";
import { ArrowRight, Music, PlayCircle } from "lucide-react";

const categoryIconMap: Record<string, string> = {
  piano: "🎹",
  bass: "🎸",
  whistle: "🎵",
  guitar: "🎸",
  drums: "🥁",
  vocals: "🎤",
  music: "🎵",
  theory: "🎼",
  ear: "👂",
  default: "🎵",
};

function getCategoryIcon(categoryName: string): string {
  const normalized = categoryName.toLowerCase().trim();
  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (normalized.includes(key)) {
      return icon;
    }
  }
  return categoryIconMap.default;
}

function getCategoryColor(index: number): string {
  const colors = [
    "from-purple-600 to-purple-500",
    "from-orange-600 to-orange-500",
    "from-blue-600 to-blue-500",
    "from-pink-600 to-pink-500",
    "from-emerald-600 to-emerald-500",
    "from-indigo-600 to-indigo-500",
  ];
  return colors[index % colors.length];
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [categories, quizStats, allSets] = await Promise.all([
    getCategories(),
    getQuizStats(),
    getAllSets(),
  ]);

  // Get the most recent featured sets
  const featuredSets = allSets.slice(-3).reverse();

  return (
    <main className="bg-dark-bg text-slate-100">
      {/* Hero Section */}
      <HeroSection stats={{
        totalQuestions: quizStats.total_questions,
        totalSets: quizStats.total_sets,
        categories: quizStats.categories_count,
      }} />

      {/* Quick Play Section */}
      <QuickPlay />

      {/* Categories Section */}
      <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-transparent to-slate-900/30">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-16">
            <h2 className="font-display font-700 text-4xl md:text-5xl mb-4">
              <span className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                Browse by Category
              </span>
            </h2>
            <p className="text-slate-400 text-lg">Master specific musical disciplines</p>
          </div>

          {/* Categories Grid - Horizontal Scroll on Mobile */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-6 md:gap-8 min-w-min md:min-w-full md:grid md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </section>

      {/* Featured Sets Section */}
      {featuredSets.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-16">
              <h2 className="font-display font-700 text-4xl md:text-5xl mb-4">
                <span className="bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">
                  Featured Sets
                </span>
              </h2>
              <p className="text-slate-400 text-lg">Curated quiz collections for focused learning</p>
            </div>

            {/* Sets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredSets.map((set) => (
                <Link key={set.set_id} href={`/quiz/${set.set_id}`}>
                  <div className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-slate-700 group-hover:to-slate-800 transition-all" />

                    {/* Gradient Accent */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />

                    {/* Content */}
                    <div className="relative z-10 h-full p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium mb-4">
                          {set.quiz_mode || "Quiz"}
                        </span>
                        <h3 className="font-display font-700 text-2xl mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
                          {set.original_title}
                        </h3>
                        <p className="text-slate-400 text-sm">{set.num_questions} questions</p>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center gap-2 text-purple-400 font-medium text-sm group-hover:text-purple-300">
                        <span>Play Now</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-transparent to-purple-900/20">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-2xl p-8 md:p-12 text-center">
            <Music className="w-16 h-16 mx-auto mb-6 text-purple-400" />
            <h2 className="font-display font-700 text-3xl md:text-4xl mb-6">
              About Nathaniel School of Music
            </h2>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed">
              These interactive music quizzes are from our weekly Instagram quiz series. Created
              by Jason Zachariah and the team at Nathaniel School of Music, our mission is to make
              music education engaging, interactive, and accessible to everyone. Whether you&apos;re a
              beginner or an advanced musician, our challenges are designed to train your ear and
              deepen your music theory knowledge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.youtube.com/@nathanielschoolofmusic"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-red-500/20"
              >
                <PlayCircle className="w-5 h-5" />
                Visit YouTube Channel
              </a>
              <a
                href="https://nathanielschool.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-purple-500 text-white font-medium rounded-lg hover:bg-purple-500/10 transition-all"
              >
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
