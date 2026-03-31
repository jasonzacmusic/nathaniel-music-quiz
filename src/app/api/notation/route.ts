import { NextRequest, NextResponse } from "next/server";
import { getNotationQuestions, getNotationCategories, getNotationStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const count = parseInt(url.searchParams.get("count") || "20", 10);
  const difficulty = url.searchParams.get("difficulty") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const stats = url.searchParams.get("stats");

  try {
    if (stats === "true") {
      const [notationStats, categories] = await Promise.all([
        getNotationStats(),
        getNotationCategories(),
      ]);
      return NextResponse.json({ stats: notationStats, categories });
    }

    const questions = await getNotationQuestions(count, difficulty, category);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Notation API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch notation questions" },
      { status: 500 }
    );
  }
}
