import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTheoryQuestions } from "@/lib/queries";
import TextQuizPlayer from "@/components/TextQuizPlayer";
import { QuestionWithShuffledAnswers } from "@/lib/queries";

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

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface TheoryQuizPageProps {
  searchParams: {
    count?: string;
    difficulty?: string;
    category?: string;
    categories?: string;
    slider?: string;
    pathId?: string;
    step?: string;
  };
}

export async function generateMetadata({ searchParams }: TheoryQuizPageProps): Promise<Metadata> {
  const parts = ["Music Theory Quiz"];
  if (searchParams.difficulty) parts.push(`(${searchParams.difficulty})`);
  if (searchParams.category) parts.push(`— ${searchParams.category}`);
  return { title: parts.join(" ") };
}

export const dynamic = "force-dynamic";

export default async function TheoryQuizPage({ searchParams }: TheoryQuizPageProps) {
  const count = searchParams.count ? parseInt(searchParams.count) : 10;
  const difficulty = searchParams.difficulty;
  const category = searchParams.category;
  const sliderParam = searchParams.slider;

  const questionCount = isNaN(count) ? 10 : Math.min(Math.max(count, 1), 50);

  let questions: QuestionWithShuffledAnswers[] | undefined;

  try {
    if (category) {
      // Single category — straightforward
      questions = await getTheoryQuestions(questionCount, difficulty, category);
    } else if (sliderParam) {
      // Tradition slider — proportionally fetch from each tradition
      const sliderValue = parseInt(sliderParam);
      const weights = getTraditionWeights(isNaN(sliderValue) ? 12 : sliderValue);
      const active = Object.entries(weights).filter(([, w]) => w > 0.05);

      // Distribute question count proportionally
      const fetches: Promise<QuestionWithShuffledAnswers[]>[] = [];
      let assigned = 0;

      for (let i = 0; i < active.length; i++) {
        const [tradition, w] = active[i];
        const tradCats = TRADITION_CATEGORIES[tradition];
        if (!tradCats || tradCats.length === 0) continue;

        const tradCount = i === active.length - 1
          ? questionCount - assigned
          : Math.max(1, Math.round(w * questionCount));
        assigned += tradCount;

        fetches.push(getTheoryQuestions(tradCount, difficulty, undefined, tradCats));
      }

      const results = await Promise.all(fetches);
      questions = shuffleArray(results.flat());
    } else {
      // Fallback — all categories
      const categoriesParam = searchParams.categories;
      const categoryList = categoriesParam
        ? categoriesParam.split(",").map((c) => c.trim()).filter(Boolean)
        : undefined;
      questions = await getTheoryQuestions(questionCount, difficulty, undefined, categoryList);
    }
  } catch (error) {
    console.error("Error fetching theory questions:", error);
    notFound();
  }

  if (!questions || questions.length === 0) {
    notFound();
  }

  const title = [
    difficulty ? `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}` : null,
    category || "Music Theory",
  ].filter(Boolean).join(" — ");

  const pathId = searchParams.pathId || undefined;
  const stepIndex = searchParams.step !== undefined ? parseInt(searchParams.step) : undefined;

  return (
    <TextQuizPlayer
      questions={questions}
      title={title}
      difficulty={difficulty}
      quizCategory={category}
      pathId={pathId}
      stepIndex={stepIndex !== undefined && !isNaN(stepIndex) ? stepIndex : undefined}
    />
  );
}
