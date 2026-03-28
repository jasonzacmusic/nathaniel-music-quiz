import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSetById, getQuestionsBySetId, getRandomQuestions, getChallengeQuestions } from "@/lib/queries";
import QuizPlayerClient from "@/components/QuizPlayerClient";

interface QuizPageProps {
  params: {
    setId: string;
  };
  searchParams: {
    count?: string;
    category?: string;
    categories?: string;
    difficulty?: string;
  };
}

export async function generateMetadata({
  params,
}: QuizPageProps): Promise<Metadata> {
  const setId = params.setId;

  if (setId !== "random" && setId !== "challenge") {
    const quizSet = await getSetById(setId);
    if (!quizSet) {
      return {
        title: "Quiz Not Found",
      };
    }
    return {
      title: `Quiz: ${quizSet.original_title} | Nathaniel Music Quiz`,
      description: `Test your knowledge on ${quizSet.original_title}. Interactive music quiz from Nathaniel School of Music.`,
    };
  }

  if (setId === "random") {
    return {
      title: "Random Quiz | Nathaniel Music Quiz",
      description: "Challenge yourself with random music theory questions from all categories.",
    };
  }

  return {
    title: "Challenge Quiz | Nathaniel Music Quiz",
    description: "Create a custom challenge and test your music knowledge.",
  };
}

export const dynamic = 'force-dynamic';

export default async function QuizPage({
  params,
  searchParams,
}: QuizPageProps) {
  const setId = params.setId;
  let questions;
  let quizSet;

  try {
    if (setId === "random") {
      // Fetch random questions
      const count = searchParams.count ? parseInt(searchParams.count) : 10;
      const category = searchParams.category;

      questions = await getRandomQuestions(count, category);

      if (!questions || questions.length === 0) {
        notFound();
      }
    } else if (setId === "challenge") {
      // Fetch challenge questions
      const count = searchParams.count ? parseInt(searchParams.count) : 15;
      const categoriesParam = searchParams.categories || "";
      const categories = categoriesParam
        ? categoriesParam.split(",").filter((c) => c.length > 0)
        : [];
      const difficulty = searchParams.difficulty;

      questions = await getChallengeQuestions(count, categories, difficulty);

      if (!questions || questions.length === 0) {
        notFound();
      }
    } else {
      // Fetch specific quiz set
      quizSet = await getSetById(setId);

      if (!quizSet) {
        notFound();
      }

      questions = await getQuestionsBySetId(setId);

      if (!questions || questions.length === 0) {
        notFound();
      }
    }
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    notFound();
  }

  return <QuizPlayerClient questions={questions} setId={setId} />;
}
