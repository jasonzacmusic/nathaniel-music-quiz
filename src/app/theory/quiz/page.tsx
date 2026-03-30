import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTheoryQuestions } from "@/lib/queries";
import TextQuizPlayer from "@/components/TextQuizPlayer";

interface TheoryQuizPageProps {
  searchParams: {
    count?: string;
    difficulty?: string;
    category?: string;
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

  const questionCount = isNaN(count) ? 10 : Math.min(Math.max(count, 1), 50);

  let questions;
  try {
    questions = await getTheoryQuestions(questionCount, difficulty, category);
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

  return <TextQuizPlayer questions={questions} title={title} />;
}
