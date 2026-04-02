import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);

const SPREADSHEET_ID = "1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8";
const GID = "0"; // First tab = Video Ear Training

function parseCSV(text) {
  const lines = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQuotes = !inQuotes; current += ch; }
    else if (ch === "\n" && !inQuotes) { lines.push(current); current = ""; }
    else { current += ch; }
  }
  if (current.trim()) lines.push(current);
  if (lines.length < 2) return [];

  function parseFields(line) {
    const fields = [];
    let val = "", q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (q && line[i + 1] === '"') { val += '"'; i++; } else { q = !q; } }
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
  console.log("Fetching video quiz data from Google Sheets (GID=0)...");
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

  const csvText = await response.text();
  const records = parseCSV(csvText);
  console.log(`Parsed ${records.length} rows from sheet`);

  // Filter valid rows
  const validRows = records.filter(r => r.set_id && r.question_text && r.correct_answer && r.quiz_mode);
  console.log(`${validRows.length} valid rows`);

  if (validRows.length === 0) {
    console.error("No valid rows found!");
    process.exit(1);
  }

  // Show sample
  console.log("\nSample row:", JSON.stringify(validRows[0], null, 2));

  // Clear existing ear_training data only
  const deleted = await sql`DELETE FROM questions WHERE quiz_type = 'ear_training' RETURNING id`;
  console.log(`\nDeleted ${deleted.length} existing ear_training questions`);
  await sql`DELETE FROM quiz_sets WHERE quiz_type = 'ear_training'`;

  // Collect unique set_ids
  const setMap = new Map();
  for (const r of validRows) {
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, { category: r.quiz_mode, count: 0 });
    setMap.get(r.set_id).count++;
  }

  // Insert quiz_sets
  for (const [setId, meta] of setMap.entries()) {
    const category = meta.category.charAt(0).toUpperCase() + meta.category.slice(1).toLowerCase();
    await sql`
      INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${setId}, ${'ear_training'}, ${category}, ${meta.count}, ${category}, ${'ear_training'})
      ON CONFLICT (set_id) DO UPDATE SET num_questions = EXCLUDED.num_questions, category = EXCLUDED.category, quiz_type = 'ear_training'
    `;
  }
  console.log(`Inserted ${setMap.size} quiz sets`);

  // Insert questions
  let inserted = 0;
  const emptyToNull = (v) => (!v || v.trim() === '') ? null : v.trim();

  for (const r of validRows) {
    const category = r.quiz_mode.charAt(0).toUpperCase() + r.quiz_mode.slice(1).toLowerCase();
    await sql`
      INSERT INTO questions (
        set_id, question_number, question_text, correct_answer,
        wrong_answer_1, wrong_answer_2, wrong_answer_3,
        youtube_title, youtube_url, video_url,
        category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data
      ) VALUES (
        ${r.set_id}, ${parseInt(r.question_number, 10) || 0}, ${r.question_text}, ${r.correct_answer},
        ${r.wrong_answer_1 || ''}, ${r.wrong_answer_2 || ''}, ${r.wrong_answer_3 || ''},
        ${emptyToNull(r.youtube_title)}, ${emptyToNull(r.youtube_url)}, ${r.video_url || ''},
        ${category}, ${emptyToNull(r["Patreon Link"])}, ${'ear_training'}, ${'beginner'},
        ${''}, ${null}, ${null}
      )
    `;
    inserted++;
    if (inserted % 100 === 0) console.log(`  Inserted ${inserted}...`);
  }

  console.log(`\nDone! Inserted ${inserted} video quiz questions across ${setMap.size} sets`);

  // Verify
  const counts = await sql`SELECT category, COUNT(*) as count FROM questions WHERE quiz_type = 'ear_training' GROUP BY category ORDER BY count DESC`;
  console.log("\nVideo quiz categories:");
  for (const c of counts) {
    console.log(`  ${c.category}: ${c.count} questions`);
  }

  const total = await sql`SELECT COUNT(*) as count FROM questions`;
  console.log(`\nTotal questions in DB: ${total[0].count}`);
}

main().catch(e => { console.error(e); process.exit(1); });
