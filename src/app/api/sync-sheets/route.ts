import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";
const SHEET_GIDS = [
  { gid: "741041831", name: "Theory Quiz v1" },
  { gid: "113832903", name: "Theory Quiz v2" },
  { gid: "1865314571", name: "Indian Music Theory" },
  { gid: "1861222925", name: "Staff Notation Quiz" },
  { gid: "1929581885", name: "Ear Training Quiz" },
];

// Shared secret to authorize sync requests (set in env)
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("secret") === secret) return true;

  return false;
}

interface QuestionRow {
  set_id: string;
  question_number: number;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  category: string;
  quiz_type: string;
  difficulty: string;
  explanation: string;
  improvement_note: string | null;
  youtube_url: string | null;
  youtube_title: string | null;
  video_url: string;
  patreon_url: string | null;
  notation_data: string | null;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers: string[] = [];
  let hCurrent = "";
  let hInQuotes = false;
  for (let i = 0; i < headerLine.length; i++) {
    const ch = headerLine[i];
    if (ch === '"') {
      hInQuotes = !hInQuotes;
    } else if (ch === "," && !hInQuotes) {
      headers.push(hCurrent.trim());
      hCurrent = "";
    } else {
      hCurrent += ch;
    }
  }
  headers.push(hCurrent.trim());

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    if (!line.trim()) continue;
    const values: string[] = [];
    let val = "";
    let vInQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (vInQuotes && line[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          vInQuotes = !vInQuotes;
        }
      } else if (ch === "," && !vInQuotes) {
        values.push(val.trim());
        val = "";
      } else {
        val += ch;
      }
    }
    values.push(val.trim());

    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      if (headers[c]) row[headers[c]] = values[c] || "";
    }
    rows.push(row);
  }
  return rows;
}

function normalizeRow(row: Record<string, string>): QuestionRow | null {
  const setId = row.set_id?.trim();
  const questionText = row.question_text?.trim();
  const correctAnswer = row.correct_answer?.trim();
  const category = row.category?.trim();

  if (!setId || !questionText || !correctAnswer || !category) return null;

  const emptyToNull = (v: string | undefined) =>
    !v || v.trim() === "" ? null : v.trim();

  return {
    set_id: setId,
    question_number: parseInt(row.question_number, 10) || 0,
    question_text: questionText,
    correct_answer: correctAnswer,
    wrong_answer_1: row.wrong_answer_1?.trim() || "",
    wrong_answer_2: row.wrong_answer_2?.trim() || "",
    wrong_answer_3: row.wrong_answer_3?.trim() || "",
    category,
    quiz_type: row.quiz_type?.trim() || "music_theory",
    difficulty: row.difficulty?.trim() || "beginner",
    explanation: row.explanation?.trim() || "",
    improvement_note: emptyToNull(row.improvement_note),
    youtube_url: emptyToNull(row.youtube_url),
    youtube_title: emptyToNull(row.youtube_title),
    video_url: row.video_url?.trim() || "",
    patreon_url: emptyToNull(row.patreon_url),
    notation_data: emptyToNull(row.notation_data),
  };
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allRows: QuestionRow[] = [];

    for (const sheet of SHEET_GIDS) {
      const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${sheet.gid}`;
      const response = await fetch(url, { cache: "no-store" });

      if (!response.ok) {
        console.error(`Failed to fetch ${sheet.name}: ${response.status}`);
        continue;
      }

      const csvText = await response.text();
      const records = parseCSV(csvText);

      for (const record of records) {
        const row = normalizeRow(record);
        if (row) allRows.push(row);
      }

      console.log(`${sheet.name}: ${records.length} rows parsed`);
    }

    // Deduplicate by question_text (prefer later sheets / v2)
    const seen = new Map<string, QuestionRow>();
    for (const row of allRows) {
      seen.set(row.question_text, row);
    }
    const uniqueRows = Array.from(seen.values());

    // SAFETY: Validate data quality before importing
    const SAFE_SYNC_TYPES = ["music_theory", "indian_classical", "staff_notation", "ear_training_text"];

    // Filter out any rows with invalid quiz_type (answer text leaking into wrong column)
    const validRows = uniqueRows.filter(r => SAFE_SYNC_TYPES.includes(r.quiz_type));
    const invalidCount = uniqueRows.length - validRows.length;

    if (invalidCount > 10) {
      return NextResponse.json({
        success: false,
        error: `${invalidCount} rows have invalid quiz_type — CSV column mapping is broken, aborting sync`,
        sample: uniqueRows.filter(r => !SAFE_SYNC_TYPES.includes(r.quiz_type)).slice(0, 3).map(r => r.quiz_type),
      });
    }

    if (validRows.length < 50) {
      return NextResponse.json({
        success: false,
        error: `Only ${validRows.length} valid rows found — too few, skipping sync`,
      });
    }

    // Use validRows from here
    const uniqueRowsFinal = validRows;

    const syncedTypes = Array.from(new Set(uniqueRowsFinal.map(r => r.quiz_type)));

    for (let i = 0; i < syncedTypes.length; i++) {
      const qt = syncedTypes[i];
      await sql`DELETE FROM questions WHERE quiz_type = ${qt}`;
      await sql`DELETE FROM quiz_sets WHERE quiz_type = ${qt}`;
    }

    // Collect unique set_ids
    const setMap = new Map<string, { category: string; count: number }>();
    for (const row of uniqueRowsFinal) {
      if (!setMap.has(row.set_id)) {
        setMap.set(row.set_id, { category: row.category, count: 0 });
      }
      setMap.get(row.set_id)!.count++;
    }

    // Insert quiz_sets
    const setEntries = Array.from(setMap.entries());
    for (let i = 0; i < setEntries.length; i++) {
      const [setId, meta] = setEntries[i];
      const qt = uniqueRowsFinal.find(r => r.set_id === setId)?.quiz_type || "music_theory";
      await sql`
        INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
        VALUES (${setId}, ${qt}, ${meta.category}, ${meta.count}, ${meta.category}, ${qt})
      `;
    }

    // Insert questions
    let inserted = 0;
    for (const row of uniqueRowsFinal) {
      await sql`
        INSERT INTO questions (
          set_id, question_number, question_text, correct_answer,
          wrong_answer_1, wrong_answer_2, wrong_answer_3,
          youtube_title, youtube_url, video_url,
          category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data
        ) VALUES (
          ${row.set_id}, ${row.question_number}, ${row.question_text}, ${row.correct_answer},
          ${row.wrong_answer_1}, ${row.wrong_answer_2}, ${row.wrong_answer_3},
          ${row.youtube_title}, ${row.youtube_url}, ${row.video_url},
          ${row.category}, ${row.patreon_url}, ${row.quiz_type}, ${row.difficulty},
          ${row.explanation}, ${row.improvement_note}, ${row.notation_data}
        )
      `;
      inserted++;
    }

    return NextResponse.json({
      success: true,
      imported: inserted,
      sets: setMap.size,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}

// GET also works (for cron services that only do GET)
export async function GET(request: NextRequest) {
  return POST(request);
}
