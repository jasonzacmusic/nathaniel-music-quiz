import { NextResponse } from "next/server";
import { getTheoryCategories, getTheoryStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [categories, stats] = await Promise.all([
      getTheoryCategories(),
      getTheoryStats(),
    ]);
    return NextResponse.json({ success: true, categories, stats });
  } catch (error) {
    console.error("Theory API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch theory data" },
      { status: 500 }
    );
  }
}
