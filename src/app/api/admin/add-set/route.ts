import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { getAccessToken } from "@/lib/google-sheets";

const QUIZ_SHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

interface ParsedQuestion {
  question_number: number;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
}

/**
 * Parse Apple Notes format into structured questions.
 *
 * Each question block (separated by ———):
 *   Question text ending with ?
 *   Answer1 (correct)  Answer2  Answer3  Answer4
 *   ... optional youtube lines (ignored) ...
 */
function parseAppleNotes(text: string): ParsedQuestion[] {
  // Split on any line of 3+ dashes/em-dashes
  const blocks = text.split(/\n\s*[—–\-_]{3,}[—–\-_\s]*\n/).filter(b => b.trim());
  const questions: ParsedQuestion[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) continue;

    // Find the question (first line ending with ?)
    const qIdx = lines.findIndex(l => l.endsWith("?"));
    if (qIdx === -1) continue;
    const questionText = lines[qIdx];

    // Answers are on the next line, tab or multi-space separated
    const aIdx = qIdx + 1;
    if (aIdx >= lines.length) continue;

    let answers: string[];
    const answerLine = lines[aIdx];

    if (answerLine.includes("\t")) {
      answers = answerLine.split("\t").map(a => a.trim()).filter(a => a.length > 0);
    } else {
      // Split on 2+ spaces
      answers = answerLine.split(/\s{2,}/).map(a => a.trim()).filter(a => a.length > 0);
    }

    if (answers.length < 2) continue;

    questions.push({
      question_number: questions.length + 1,
      question_text: questionText,
      correct_answer: answers[0],
      wrong_answer_1: answers[1] || "",
      wrong_answer_2: answers[2] || "",
      wrong_answer_3: answers[3] || "",
    });
  }

  return questions;
}

/**
 * Append questions to the Video Ear Training sheet (gid=0).
 * Uses the quiz spreadsheet, not the leads sheet.
 */
async function appendToQuizSheet(
  setId: string,
  category: string,
  questions: ParsedQuestion[]
): Promise<boolean> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    console.warn("Google Sheets env vars not configured, skipping sheet sync");
    return false;
  }

  try {
    // We need to use the quiz spreadsheet ID, not GOOGLE_SHEET_ID (which is for leads)
    const accessToken = await getAccessToken(email, privateKey);

    const range = `Video Ear Training!A:M`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${QUIZ_SHEET_ID}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    // Build rows matching sheet columns:
    // set_id, question_number, quiz_mode, question_text, correct_answer, wrong1, wrong2, wrong3, youtube_title, youtube_url, video_url
    const rows = questions.map(q => [
      setId,
      String(q.question_number),
      category.toLowerCase(),
      q.question_text,
      q.correct_answer,
      q.wrong_answer_1,
      q.wrong_answer_2,
      q.wrong_answer_3,
      "", // youtube_title — user fills later
      "", // youtube_url — user fills later
      "", // video_url — user fills later
    ]);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: rows }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Google Sheets sync error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Google Sheets sync failed:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { set_id, category, notes_text } = body;

    if (!set_id || !category || !notes_text) {
      return NextResponse.json(
        { error: "set_id, category, and notes_text are required" },
        { status: 400 }
      );
    }

    // Check if set_id already exists
    const existing = await sql`SELECT set_id FROM quiz_sets WHERE set_id = ${set_id}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Set "${set_id}" already exists. Choose a different ID.` },
        { status: 409 }
      );
    }

    // Parse the Apple Notes format
    const questions = parseAppleNotes(notes_text);

    if (questions.length === 0) {
      return NextResponse.json({
        error: "Could not parse any questions. Each question needs a line ending with '?' followed by answers separated by tabs or double-spaces, with ——— between questions.",
      }, { status: 400 });
    }

    // 1. Insert into Neon database
    await sql`
      INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${set_id}, ${category.toLowerCase()}, ${category}, ${questions.length}, ${category}, 'ear_training')
    `;

    for (const q of questions) {
      await sql`
        INSERT INTO questions (
          set_id, question_number, question_text, correct_answer,
          wrong_answer_1, wrong_answer_2, wrong_answer_3,
          category, quiz_type
        ) VALUES (
          ${set_id}, ${q.question_number}, ${q.question_text}, ${q.correct_answer},
          ${q.wrong_answer_1}, ${q.wrong_answer_2}, ${q.wrong_answer_3},
          ${category}, 'ear_training'
        )
      `;
    }

    // 2. Sync to Google Sheets (best-effort, don't fail if it doesn't work)
    let sheetSynced = false;
    try {
      sheetSynced = await appendToQuizSheet(set_id, category, questions);
    } catch {
      // Non-fatal
    }

    return NextResponse.json({
      success: true,
      set_id,
      questions_added: questions.length,
      sheet_synced: sheetSynced,
      preview: questions.map(q => ({
        q: q.question_text,
        a: q.correct_answer,
      })),
    });
  } catch (error) {
    console.error("Add set error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add set" },
      { status: 500 }
    );
  }
}
