import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";
const SHEET_GIDS = [
  { gid: "1466473607", name: "Verified Database" }, // Audited video ear training (replaces GID 0)
  { gid: "741041831", name: "Theory Quiz v1" },
  { gid: "113832903", name: "Theory Quiz v2" },
  { gid: "1865314571", name: "Indian Music Theory" },
  { gid: "1929581885", name: "Staff Notation Quiz" },
  { gid: "1861222925", name: "Ear Training Quiz" },
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
  // Split text into logical lines, preserving quoted fields that span multiple lines.
  // IMPORTANT: keep quotes in the output so the value parser can handle commas inside quotes.
  const lines: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch; // keep the quote
    } else if (ch === "\n" && !inQuotes) {
      lines.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  if (lines.length < 2) return [];

  // Parse a single CSV line into field values (handles quotes + escaped "")
  function parseFields(line: string): string[] {
    const fields: string[] = [];
    let val = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (q && line[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          q = !q;
        }
      } else if (ch === "," && !q) {
        fields.push(val);
        val = "";
      } else {
        val += ch;
      }
    }
    fields.push(val);
    return fields;
  }

  const headers = parseFields(lines[0]).map((h) => h.trim());

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    if (!line.trim()) continue;
    const values = parseFields(line);

    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      if (headers[c]) row[headers[c]] = (values[c] || "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function normalizeRow(row: Record<string, string>): QuestionRow | null {
  // Skip rows flagged as WRONG_VIDEO in the Verified Database
  const flags = row["⚠️ FLAGS"]?.trim() || row["FLAGS"]?.trim() || "";
  if (flags === "WRONG_VIDEO") return null;

  const setId = row.set_id?.trim();
  // Strip only answer-revealing hints from notation questions:
  // "(Notes: [CEG])", "(G above staff)", "(A-sharp fourth line)", "(Pattern: ABCDEF#G#A)"
  // but keep descriptive context like "(2 pairs of 2)" for rhythm questions
  let questionText = row.question_text?.trim();
  if (questionText && questionText.includes("(")) {
    // Only strip if the parenthetical contains note names, ABC notation, or staff positions
    const parenMatch = questionText.match(/\s*\((.+)$/);
    if (parenMatch) {
      const hint = parenMatch[1];
      const isAnswerHint = /Notes:|Pattern:|clef|line|ledger|staff|sharp|flat|above|below|middle|first|second|third|fourth|fifth/i.test(hint)
        || /^[A-G][#♭b]?\s/.test(hint); // starts with a note name
      if (isAnswerHint) {
        questionText = questionText.replace(/\s*\(.*$/, "").trim();
      }
    }
  }
  const correctAnswer = row.correct_answer?.trim();
  // Video quiz sheet uses "quiz_mode" as category (e.g. "piano", "bass")
  const category = row.category?.trim() || row.quiz_mode?.trim();

  if (!setId || !questionText || !correctAnswer || !category) return null;

  const emptyToNull = (v: string | undefined) =>
    !v || v.trim() === "" ? null : v.trim();

  // Detect video quiz rows: they have quiz_mode (piano/bass) and video_url with CDN links,
  // but no quiz_type column. Capitalize category for display (e.g. "piano" → "Piano").
  const hasVideoUrl = row.video_url?.trim() && row.video_url.trim().length > 5;
  const isVideoQuiz = !row.quiz_type && row.quiz_mode && hasVideoUrl;

  const displayCategory = isVideoQuiz
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : category;

  // Deduplicate answers: remove wrong answers that match correct or each other
  let w1 = row.wrong_answer_1?.trim() || "";
  let w2 = row.wrong_answer_2?.trim() || "";
  let w3 = row.wrong_answer_3?.trim() || "";
  if (w1 === correctAnswer) w1 = "";
  if (w2 === correctAnswer || w2 === w1) w2 = "";
  if (w3 === correctAnswer || w3 === w1 || w3 === w2) w3 = "";

  return {
    set_id: setId,
    question_number: parseInt(row.question_number, 10) || 0,
    question_text: questionText,
    correct_answer: correctAnswer,
    wrong_answer_1: w1,
    wrong_answer_2: w2,
    wrong_answer_3: w3,
    category: displayCategory,
    quiz_type: isVideoQuiz ? "ear_training" : (row.quiz_type?.trim() || "music_theory"),
    difficulty: row.difficulty?.trim() || "beginner",
    explanation: row.explanation?.trim() || "",
    improvement_note: emptyToNull(row.improvement_note),
    youtube_url: emptyToNull(row.youtube_url),
    youtube_title: emptyToNull(row.youtube_title),
    video_url: row.video_url?.trim() || "",
    patreon_url: emptyToNull(row.patreon_url || row["Patreon Link"]),
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

    // Deduplicate: use question_text + correct_answer + notation_data as key
    // so that staff notation questions with the same text but different content are kept
    const seen = new Map<string, QuestionRow>();
    for (const row of allRows) {
      const key = `${row.question_text}|${row.correct_answer}|${row.notation_data || ""}`;
      seen.set(key, row);
    }
    const uniqueRows = Array.from(seen.values());

    // SAFETY: Validate data quality before importing
    const SAFE_SYNC_TYPES = ["ear_training", "music_theory", "indian_classical", "staff_notation", "ear_training_text"];

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

    // Only delete questions/sets for the quiz types we're about to re-import.
    // Preserve hand-crafted rhythm notation questions (set_id starts with 'notation-rhythm')
    // Preserve hand-crafted/generated questions (set_ids starting with 'gen-' or 'notation-rhythm')
    await sql`DELETE FROM questions WHERE quiz_type = ANY(${SAFE_SYNC_TYPES}) AND set_id NOT LIKE 'gen-%' AND set_id NOT LIKE 'notation-rhythm%'`;
    await sql`DELETE FROM quiz_sets WHERE quiz_type = ANY(${SAFE_SYNC_TYPES}) AND set_id NOT LIKE 'gen-%' AND set_id NOT LIKE 'notation-rhythm%'`;

    const BATCH_SIZE = 50;

    // Collect unique set_ids
    const setMap = new Map<string, { category: string; count: number }>();
    for (const row of uniqueRowsFinal) {
      if (!setMap.has(row.set_id)) {
        setMap.set(row.set_id, { category: row.category, count: 0 });
      }
      setMap.get(row.set_id)!.count++;
    }

    // Insert quiz_sets in batches (ON CONFLICT for shared set_ids across quiz types)
    const setEntries = Array.from(setMap.entries());
    for (let i = 0; i < setEntries.length; i += BATCH_SIZE) {
      const batch = setEntries.slice(i, i + BATCH_SIZE);
      const promises = batch.map(([setId, meta]) => {
        const qt = uniqueRowsFinal.find(r => r.set_id === setId)?.quiz_type || "music_theory";
        return sql`
          INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
          VALUES (${setId}, ${qt}, ${meta.category}, ${meta.count}, ${meta.category}, ${qt})
          ON CONFLICT (set_id) DO UPDATE SET num_questions = EXCLUDED.num_questions
        `;
      });
      await Promise.all(promises);
    }

    // Insert questions in concurrent batches
    for (let i = 0; i < uniqueRowsFinal.length; i += BATCH_SIZE) {
      const batch = uniqueRowsFinal.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((row) =>
        sql`
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
        `
      ));
    }

    // Verify inserts actually persisted
    const verifyResult = await sql`SELECT COUNT(*) as count FROM questions`;
    const actualCount = parseInt((verifyResult[0] as { count: string }).count, 10);

    return NextResponse.json({
      success: true,
      expected: uniqueRowsFinal.length,
      imported: actualCount,
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
