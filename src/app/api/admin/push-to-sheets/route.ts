import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getAccessToken } from "@/lib/google-sheets";

const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";
const NOTATION_SHEET = "Staff Notation Quiz"; // gid 1929581885

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;
  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    return NextResponse.json({ error: "Google Sheets credentials not configured" }, { status: 500 });
  }

  try {
    const accessToken = await getAccessToken(email, privateKey);

    // 1. Read all staff notation questions from Neon
    const questions = await sql`
      SELECT set_id, question_number, question_text, correct_answer,
        wrong_answer_1, wrong_answer_2, wrong_answer_3,
        category, quiz_type, difficulty, explanation, improvement_note, notation_data
      FROM questions
      WHERE quiz_type = 'staff_notation'
      ORDER BY category, id
    `;

    if (questions.length === 0) {
      return NextResponse.json({ error: "No notation questions in database" }, { status: 400 });
    }

    // 2. Clear the existing Staff Notation sheet (keep header row)
    const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(NOTATION_SHEET + "!A2:M10000")}:clear`;
    await fetch(clearUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    // 3. Write all questions back to the sheet
    const rows = questions.map((q, i) => [
      q.set_id,
      String(i + 1),
      q.question_text,
      q.correct_answer,
      q.wrong_answer_1 || "",
      q.wrong_answer_2 || "",
      q.wrong_answer_3 || "",
      q.category,
      q.quiz_type,
      q.difficulty || "beginner",
      q.explanation || "",
      q.improvement_note || "",
      q.notation_data || "",
    ]);

    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(NOTATION_SHEET + "!A2")}?valueInputOption=USER_ENTERED`;
    const writeRes = await fetch(writeUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ values: rows }),
    });

    if (!writeRes.ok) {
      const err = await writeRes.text();
      return NextResponse.json({ error: "Sheet write failed: " + err }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      rows_written: rows.length,
      categories: Array.from(new Set(questions.map(q => q.category))),
      message: `Pushed ${rows.length} questions to "${NOTATION_SHEET}" in Google Sheets`,
    });
  } catch (error) {
    console.error("Push to sheets error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to push" },
      { status: 500 }
    );
  }
}

// GET also works for browser access
export async function GET(request: NextRequest) {
  return POST(request);
}
