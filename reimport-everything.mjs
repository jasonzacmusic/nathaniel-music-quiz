import { neon } from '@neondatabase/serverless';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
const emptyToNull = (v) => (!v || v.trim() === '') ? null : v.trim();

// ── Step 1: Import video quizzes from Google Sheets ──

async function importVideoQuizzes() {
  console.log("=== Fetching video quizzes from Google Sheets ===");
  const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Sheet fetch failed: ${response.status}`);

  const csvText = await response.text();
  const rows = parseGSheetCSV(csvText);
  const valid = rows.filter(r => r.set_id && r.question_text && r.correct_answer && r.quiz_mode);
  console.log(`  Parsed ${rows.length} rows, ${valid.length} valid`);

  // Insert sets
  const setMap = new Map();
  for (const r of valid) {
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, { category: r.quiz_mode, count: 0 });
    setMap.get(r.set_id).count++;
  }
  for (const [setId, meta] of setMap.entries()) {
    const cat = meta.category.charAt(0).toUpperCase() + meta.category.slice(1).toLowerCase();
    await sql`INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${setId}, ${'ear_training'}, ${cat}, ${meta.count}, ${cat}, ${'ear_training'})
      ON CONFLICT (set_id) DO UPDATE SET num_questions = EXCLUDED.num_questions, quiz_type = 'ear_training'`;
  }

  // Insert questions
  let inserted = 0;
  for (const r of valid) {
    const cat = r.quiz_mode.charAt(0).toUpperCase() + r.quiz_mode.slice(1).toLowerCase();
    await sql`INSERT INTO questions (set_id, question_number, question_text, correct_answer,
      wrong_answer_1, wrong_answer_2, wrong_answer_3, youtube_title, youtube_url, video_url,
      category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data)
      VALUES (${r.set_id}, ${parseInt(r.question_number,10)||0}, ${r.question_text}, ${r.correct_answer},
      ${r.wrong_answer_1||''}, ${r.wrong_answer_2||''}, ${r.wrong_answer_3||''},
      ${emptyToNull(r.youtube_title)}, ${emptyToNull(r.youtube_url)}, ${r.video_url||''},
      ${cat}, ${emptyToNull(r["Patreon Link"])}, ${'ear_training'}, ${'beginner'}, ${''}, ${null}, ${null})`;
    inserted++;
  }
  console.log(`  Video quizzes: ${inserted} questions, ${setMap.size} sets`);
  return inserted;
}

function parseGSheetCSV(text) {
  const lines = [];
  let current = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQuotes = !inQuotes; current += ch; }
    else if (ch === "\n" && !inQuotes) { lines.push(current); current = ""; }
    else { current += ch; }
  }
  if (current.trim()) lines.push(current);
  if (lines.length < 2) return [];

  function parseFields(line) {
    const fields = []; let val = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (q && line[i+1] === '"') { val += '"'; i++; } else { q = !q; } }
      else if (ch === "," && !q) { fields.push(val); val = ""; }
      else { val += ch; }
    }
    fields.push(val);
    return fields;
  }

  const headers = parseFields(lines[0]).map(h => h.trim());
  const rows = [];
  for (let r = 1; r < lines.length; r++) {
    if (!lines[r].trim()) continue;
    const values = parseFields(lines[r]);
    const row = {};
    for (let c = 0; c < headers.length; c++) {
      if (headers[c]) row[headers[c]] = (values[c] || "").trim();
    }
    rows.push(row);
  }
  return rows;
}

// ── Step 2: Import local CSVs ──

async function importCSV(file, forceQuizType) {
  const csv = readFileSync(file, 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });
  const rows = records.filter(r => r.set_id && r.question_text && r.correct_answer);
  console.log(`  ${file}: ${rows.length} valid rows`);

  // Insert sets first — ALL of them before any questions
  const setMap = new Map();
  for (const r of rows) {
    const qt = forceQuizType || r.quiz_type || 'music_theory';
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, { category: r.category, count: 0, qt });
    setMap.get(r.set_id).count++;
  }
  for (const [setId, meta] of setMap.entries()) {
    await sql`INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${setId}, ${meta.qt}, ${meta.category}, ${meta.count}, ${meta.category}, ${meta.qt})
      ON CONFLICT (set_id) DO UPDATE SET num_questions = EXCLUDED.num_questions, quiz_type = EXCLUDED.quiz_type`;
  }
  console.log(`  ${file}: ${setMap.size} sets`);

  // Verify sets exist
  const setCheck = await sql`SELECT COUNT(*) as count FROM quiz_sets WHERE set_id = ANY(${Array.from(setMap.keys())})`;
  console.log(`  ${file}: ${setCheck[0].count} sets verified in DB`);

  // Insert questions
  let inserted = 0, errors = 0;
  for (const r of rows) {
    const qt = forceQuizType || r.quiz_type || 'music_theory';
    try {
      await sql`INSERT INTO questions (set_id, question_number, question_text, correct_answer,
        wrong_answer_1, wrong_answer_2, wrong_answer_3, youtube_title, youtube_url, video_url,
        category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data)
        VALUES (${r.set_id}, ${parseInt(r.question_number,10)||0}, ${r.question_text}, ${r.correct_answer},
        ${r.wrong_answer_1||''}, ${r.wrong_answer_2||''}, ${r.wrong_answer_3||''}, ${emptyToNull(r.youtube_title)},
        ${emptyToNull(r.youtube_url)}, ${r.video_url||''}, ${r.category}, ${emptyToNull(r.patreon_url)},
        ${qt}, ${r.difficulty||'beginner'}, ${r.explanation||''}, ${emptyToNull(r.improvement_note)}, ${emptyToNull(r.notation_data)})`;
      inserted++;
    } catch (e) {
      errors++;
      if (errors <= 5) console.error(`  FK error: ${r.set_id} - ${e.detail || e.message}`);
    }
    if (inserted > 0 && inserted % 200 === 0) console.log(`  ${file}: ${inserted} inserted...`);
  }
  if (errors > 0) console.log(`  ${file}: ${errors} errors (skipped)`);
  return inserted;
}

// ── Main ──

async function main() {
  // Clean slate
  console.log("=== Truncating all data ===");
  await sql`TRUNCATE TABLE questions CASCADE`;
  await sql`TRUNCATE TABLE quiz_sets CASCADE`;

  const video = await importVideoQuizzes();

  console.log("\n=== Importing local CSVs ===");
  const t1 = await importCSV('music_theory_questions.csv', 'music_theory');
  const t2 = await importCSV('music_theory_questions_2.csv', 'music_theory');
  const ind = await importCSV('indian_music.csv', 'indian_classical');
  const notation = await importCSV('staff_notation.csv', 'staff_notation');
  const ear = await importCSV('ear_training_text.csv', 'ear_training_text');

  // Final verification
  console.log("\n=== FINAL VERIFICATION ===");
  const counts = await sql`SELECT quiz_type, COUNT(*) as count FROM questions GROUP BY quiz_type ORDER BY count DESC`;
  let total = 0;
  counts.forEach(c => { console.log(`  ${c.quiz_type}: ${c.count}`); total += parseInt(c.count); });
  console.log(`  TOTAL: ${total}`);

  const cats = await sql`SELECT category, COUNT(*) as count FROM questions WHERE quiz_type = 'ear_training' GROUP BY category ORDER BY count DESC`;
  console.log("\nVideo quiz categories:");
  cats.forEach(c => console.log(`  ${c.category}: ${c.count}`));
}

main().catch(e => { console.error(e); process.exit(1); });
