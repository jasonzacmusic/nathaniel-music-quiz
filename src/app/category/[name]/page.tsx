import { getAllSets, getCategories } from "@/lib/queries";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

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

interface PageProps {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  return {
    title: `${decodedName} - Nathaniel Music Quiz`,
    description: `Explore ${decodedName} music quizzes. Test your knowledge with interactive challenges from Nathaniel School of Music.`,
  };
}

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const allSets = await getAllSets();
  const allCategories = await getCategories();

  // Filter sets by category matching the category name
  const categorySets = allSets.filter(
    (set) => set.category && set.category.toLowerCase() === decodedName.toLowerCase()
  );

  const categoryInfo = allCategories.find(
    (cat) => cat.category.toLowerCase() === decodedName.toLowerCase()
  );

  const totalQuestions = categoryInfo?.count || 0;
  const categoryIcon = getCategoryIcon(decodedName);

  // Color based on category name
  const getGradientColor = (name: string): string => {
    const normalized = name.toLowerCase();
    if (normalized.includes("piano")) return "from-purple-600 to-purple-500";
    if (normalized.includes("bass")) return "from-orange-600 to-orange-500";
    if (normalized.includes("whistle") || normalized.includes("vocal")) return "from-pink-600 to-pink-500";
    if (normalized.includes("drum")) return "from-red-600 to-red-500";
    if (normalized.includes("guitar")) return "from-emerald-600 to-emerald-500";
    return "from-blue-600 to-blue-500";
  };

  const gradientColor = getGradientColor(decodedName);

  return (
    <main className="bg-dark-bg text-slate-100 min-h-screen">
      {/* Category Header */}
      <section className={`bg-gradient-to-br ${gradientColor} relative py-20 px-4 sm:px-6 lg:px-8`}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <div className="text-7xl md:text-8xl">{categoryIcon}</div>
            <div>
              <h1 className="font-display font-700 text-4xl md:text-5xl text-white mb-2">
                {decodedName}
              </h1>
              <p className="text-white/90 text-lg">
                {totalQuestions} {totalQuestions === 1 ? "question" : "questions"} • Master your skills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quiz Sets Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {categorySets.length > 0 ? (
            <>
              <div className="mb-12">
                <h2 className="font-display font-700 text-3xl md:text-4xl">
                  <span className="bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                    Available Quiz Sets
                  </span>
                </h2>
                <p className="text-slate-400 mt-2">
                  {categorySets.length} {categorySets.length === 1 ? "set" : "sets"} available in this category
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {categorySets.map((set) => (
                  <Link key={set.set_id} href={`/quiz/${set.set_id}`}>
                    <div className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer border border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-lg hover:shadow-purple-500/20">
                      {/* Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 group-hover:from-slate-700 group-hover:to-slate-800 transition-all" />

                      {/* Gradient Accent */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradientColor}/20 opacity-0 group-hover:opacity-100 transition-opacity`} />

                      {/* Content */}
                      <div className="relative z-10 h-full p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-xl">{categoryIcon}</span>
                            <span className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                              {set.quiz_mode || "Quiz"}
                            </span>
                          </div>
                          <h3 className="font-display font-700 text-2xl md:text-3xl mb-3 line-clamp-3 group-hover:text-purple-300 transition-colors">
                            {set.original_title}
                          </h3>
                          <p className="text-slate-400 text-sm">
                            {set.num_questions} {set.num_questions === 1 ? "question" : "questions"}
                          </p>
                        </div>

                        {/* Meta Info */}
                        <div className="pt-4 border-t border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-4">
                            Added {new Date(set.created_at).toLocaleDateString()}
                          </p>

                          {/* CTA */}
                          <div className="flex items-center gap-2 text-purple-400 font-medium text-sm group-hover:text-purple-300">
                            <span>Start Quiz</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">{categoryIcon}</div>
              <h3 className="font-display font-700 text-2xl mb-2">No quizzes yet</h3>
              <p className="text-slate-400 mb-8">
                No quiz sets are available in the {decodedName} category yet. Check back soon!
              </p>
              <Link href="/">
                <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium rounded-lg transition-all hover:shadow-lg">
                  Browse Other Categories
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
