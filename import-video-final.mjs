import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL);

const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";

function parseCSV(text) {
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

async function main() {
  // Use NEON_DATABASE_URL explicitly
  console.log("Connection:", process.env.NEON_DATABASE_URL.substring(0, 40) + "...");

  console.log("Fetching video quiz data...");
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed: ${response.status}`);

  const csvText = await response.text();
  const records = parseCSV(csvText);
  const valid = records.filter(r => r.set_id && r.question_text && r.correct_answer && r.quiz_mode);
  console.log(`${valid.length} valid rows`);

  // Delete existing ear_training data
  await sql`DELETE FROM questions WHERE quiz_type = 'ear_training'`;
  await sql`DELETE FROM quiz_sets WHERE quiz_type = 'ear_training'`;
  console.log("Cleared old ear_training data");

  // Collect sets
  const setMap = new Map();
  for (const r of valid) {
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, { category: r.quiz_mode, count: 0 });
    setMap.get(r.set_id).count++;
  }

  // Insert sets one by one with verification
  for (const [setId, meta] of setMap.entries()) {
    const cat = meta.category.charAt(0).toUpperCase() + meta.category.slice(1).toLowerCase();
    await sql`INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${setId}, ${'ear_training'}, ${cat}, ${meta.count}, ${cat}, ${'ear_training'})
      ON CONFLICT (set_id) DO UPDATE SET quiz_type = 'ear_training', num_questions = EXCLUDED.num_questions, category = EXCLUDED.category`;
  }

  // Verify sets
  const setCount = await sql`SELECT COUNT(*) as count FROM quiz_sets WHERE quiz_type = 'ear_training'`;
  console.log(`Sets in DB: ${setCount[0].count} (expected ${setMap.size})`);

  if (parseInt(setCount[0].count) < setMap.size * 0.9) {
    console.error("Set insertion incomplete! Aborting.");
    process.exit(1);
  }

  // Insert questions
  let inserted = 0, errors = 0;
  const emptyToNull = (v) => (!v || v.trim() === '') ? null : v.trim();

  for (const r of valid) {
    const cat = r.quiz_mode.charAt(0).toUpperCase() + r.quiz_mode.slice(1).toLowerCase();
    try {
      await sql`INSERT INTO questions (set_id, question_number, question_text, correct_answer,
        wrong_answer_1, wrong_answer_2, wrong_answer_3, youtube_title, youtube_url, video_url,
        category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data)
        VALUES (${r.set_id}, ${parseInt(r.question_number, 10) || 0}, ${r.question_text}, ${r.correct_answer},
        ${r.wrong_answer_1 || ''}, ${r.wrong_answer_2 || ''}, ${r.wrong_answer_3 || ''},
        ${emptyToNull(r.youtube_title)}, ${emptyToNull(r.youtube_url)}, ${r.video_url || ''},
        ${cat}, ${emptyToNull(r["Patreon Link"])}, ${'ear_training'}, ${'beginner'}, ${''}, ${null}, ${null})`;
      inserted++;
    } catch (e) {
      errors++;
      if (errors <= 3) console.error(`Error on ${r.set_id}: ${e.detail || e.message}`);
    }
    if (inserted % 50 === 0 && inserted > 0) process.stdout.write(`${inserted}...`);
  }
  console.log(`\nInserted: ${inserted}, Errors: ${errors}`);

  // CRITICAL: Verify data persisted
  const finalCount = await sql`SELECT COUNT(*) as count FROM questions WHERE quiz_type = 'ear_training'`;
  console.log(`\nFINAL VERIFICATION: ${finalCount[0].count} ear_training questions in DB`);

  const cats = await sql`SELECT category, COUNT(*) as count FROM questions WHERE quiz_type = 'ear_training' GROUP BY category ORDER BY count DESC`;
  cats.forEach(c => console.log(`  ${c.category}: ${c.count}`));

  if (parseInt(finalCount[0].count) === 0) {
    console.error("\n*** DATA NOT PERSISTING - CHECK NEON DATABASE ***");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
