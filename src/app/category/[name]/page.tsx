import { getCategories } from "@/lib/queries";
import Link from "next/link";
import { Play, Zap, Target, Trophy } from "lucide-react";

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
    if (normalized.includes(key)) return icon;
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
    description: `Test your ${decodedName} knowledge with interactive quizzes from Nathaniel School of Music.`,
  };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: PageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const allCategories = await getCategories();

  const categoryInfo = allCategories.find(
    (cat) => cat.category.toLowerCase() === decodedName.toLowerCase()
  );

  const totalQuestions = categoryInfo?.count || 0;
  const categoryIcon = getCategoryIcon(decodedName);

  const getGradientColor = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes("chord")) return "from-violet-600 to-purple-500";
    if (n.includes("rhythm")) return "from-blue-600 to-cyan-500";
    if (n.includes("scale")) return "from-emerald-600 to-teal-500";
    if (n.includes("interval")) return "from-orange-600 to-amber-500";
    if (n.includes("theory")) return "from-pink-600 to-rose-500";
    if (n.includes("bass")) return "from-red-600 to-orange-500";
    if (n.includes("piano")) return "from-purple-600 to-violet-500";
    if (n.includes("composition")) return "from-indigo-600 to-blue-500";
    return "from-purple-600 to-blue-500";
  };

  const gradientColor = getGradientColor(decodedName);
  const encodedCategory = encodeURIComponent(decodedName);

  const quizModes = [
    {
      count: 5,
      label: "Quick Round",
      sublabel: "5 questions",
      icon: Zap,
      description: "Perfect for a quick practice session",
    },
    {
      count: 10,
      label: "Standard",
      sublabel: "10 questions",
      icon: Play,
      description: "The classic quiz experience",
    },
    {
      count: 15,
      label: "Deep Dive",
      sublabel: "15 questions",
      icon: Target,
      description: "For serious learners",
    },
    {
      count: totalQuestions,
      label: "Marathon",
      sublabel: `All ${totalQuestions} questions`,
      icon: Trophy,
      description: "Master every question",
    },
  ].filter((mode) => mode.count <= totalQuestions && mode.count > 0);

  return (
    <main className="bg-dark-bg text-slate-100 min-h-screen">
      {/* Category Header */}
      <section
        className={`bg-gradient-to-br ${gradientColor} relative py-24 px-4 sm:px-6 lg:px-8`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="text-7xl md:text-8xl mb-6">{categoryIcon}</div>
          <h1 className="font-display font-700 text-4xl md:text-6xl text-white mb-4">
            {decodedName}
          </h1>
          <p className="text-white/80 text-lg md:text-xl">
            {totalQuestions} {totalQuestions === 1 ? "question" : "questions"}{" "}
            available
          </p>
        </div>
      </section>

      {/* Quiz Modes */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-700 text-2xl md:text-3xl text-center mb-3">
            <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Choose Your Challenge
            </span>
          </h2>
          <p className="text-slate-400 text-center mb-10">
            Select how many questions you want to tackle
          </p>

          <div className="grid gap-4">
            {quizModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Link
                  key={mode.count}
                  href={`/quiz/random?count=${mode.count}&category=${encodedCategory}`}
                >
                  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${gradientColor} bg-opacity-20 shrink-0`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3">
                          <h3 className="font-display font-700 text-lg text-white group-hover:text-white/90">
                            {mode.label}
                          </h3>
                          <span className="text-sm text-slate-400">
                            {mode.sublabel}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {mode.description}
                        </p>
                      </div>
                      <div className="text-slate-500 group-hover:text-white/70 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Back to categories */}
          <div className="text-center mt-10">
            <Link
              href="/#categories"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Browse other categories
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
