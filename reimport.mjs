import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
const SPREADSHEET_ID = '1QpCaISHeccQga17igp3ekDz-nJUFwsgSOi2wwXQLyJ8';
const SHEET_GIDS = [
  { gid: '0', name: 'Video Ear Training' },
  { gid: '741041831', name: 'Theory Quiz v1' },
  { gid: '113832903', name: 'Theory Quiz v2' },
  { gid: '1865314571', name: 'Indian Music Theory' },
  { gid: '1861222925', name: 'Staff Notation Quiz' },
  { gid: '1929581885', name: 'Ear Training Quiz' },
];

function parseCSV(text) {
  const lines = []; let current = ''; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQuotes = !inQuotes; current += ch; }
    else if (ch === '\n' && !inQuotes) { lines.push(current); current = ''; }
    else { current += ch; }
  }
  if (current.trim()) lines.push(current);
  if (lines.length < 2) return [];
  function parseFields(line) {
    const fields = []; let val = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { if (q && line[i+1] === '"') { val += '"'; i++; } else { q = !q; } }
      else if (ch === ',' && !q) { fields.push(val); val = ''; }
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
      if (headers[c]) row[headers[c]] = (values[c] || '').trim();
    }
    rows.push(row);
  }
  return rows;
}

function normalizeRow(row) {
  const setId = row.set_id?.trim();
  const questionText = row.question_text?.trim();
  const correctAnswer = row.correct_answer?.trim();
  const category = row.category?.trim() || row.quiz_mode?.trim();
  if (!setId || !questionText || !correctAnswer || !category) return null;
  const emptyToNull = v => !v || v.trim() === '' ? null : v.trim();
  const hasVideoUrl = row.video_url?.trim() && row.video_url.trim().length > 5;
  const isVideoQuiz = !row.quiz_type && row.quiz_mode && hasVideoUrl;
  const displayCategory = isVideoQuiz ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : category;
  return {
    set_id: setId, question_number: parseInt(row.question_number, 10) || 0,
    question_text: questionText, correct_answer: correctAnswer,
    wrong_answer_1: row.wrong_answer_1?.trim() || '', wrong_answer_2: row.wrong_answer_2?.trim() || '',
    wrong_answer_3: row.wrong_answer_3?.trim() || '', category: displayCategory,
    quiz_type: isVideoQuiz ? 'ear_training' : (row.quiz_type?.trim() || 'music_theory'),
    difficulty: row.difficulty?.trim() || 'beginner', explanation: row.explanation?.trim() || '',
    improvement_note: emptyToNull(row.improvement_note),
    youtube_url: emptyToNull(row.youtube_url), youtube_title: emptyToNull(row.youtube_title),
    video_url: row.video_url?.trim() || '',
    patreon_url: emptyToNull(row.patreon_url || row['Patreon Link']),
    notation_data: emptyToNull(row.notation_data),
  };
}

// Escape a value for SQL
function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  return "'" + String(v).replace(/'/g, "''") + "'";
}

async function main() {
  const allRows = [];
  for (const sheet of SHEET_GIDS) {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${sheet.gid}`;
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) { console.error('Failed:', sheet.name, resp.status); continue; }
    const csvText = await resp.text();
    const records = parseCSV(csvText);
    for (const record of records) {
      const row = normalizeRow(record);
      if (row) allRows.push(row);
    }
    console.log(`${sheet.name}: ${records.length} rows parsed`);
  }

  const seen = new Map();
  for (const row of allRows) seen.set(row.question_text, row);
  const SAFE = ['ear_training', 'music_theory', 'indian_classical', 'staff_notation', 'ear_training_text'];
  const validRows = Array.from(seen.values()).filter(r => SAFE.includes(r.quiz_type));

  const typeCounts = {};
  for (const r of validRows) typeCounts[r.quiz_type] = (typeCounts[r.quiz_type] || 0) + 1;
  console.log('Valid:', validRows.length, JSON.stringify(typeCounts));

  // Collect all unique set_ids from questions
  const setMap = new Map();
  for (const row of validRows) {
    if (!setMap.has(row.set_id)) setMap.set(row.set_id, { category: row.category, count: 0, qt: row.quiz_type });
    setMap.get(row.set_id).count++;
  }

  // Insert sets one by one (only ~1000, manageable)
  let setCount = 0;
  for (const [setId, meta] of setMap.entries()) {
    await sql`INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${setId}, ${meta.qt}, ${meta.category}, ${meta.count}, ${meta.category}, ${meta.qt})
      ON CONFLICT (set_id) DO UPDATE SET num_questions = EXCLUDED.num_questions, quiz_type = EXCLUDED.quiz_type`;
    setCount++;
  }
  console.log(`Inserted ${setCount} sets`);

  // Insert questions in batches of 25 using raw SQL
  const BATCH = 25;
  let inserted = 0;
  for (let i = 0; i < validRows.length; i += BATCH) {
    const batch = validRows.slice(i, i + BATCH);
    const values = batch.map(r =>
      `(${esc(r.set_id)}, ${r.question_number}, ${esc(r.question_text)}, ${esc(r.correct_answer)},
        ${esc(r.wrong_answer_1)}, ${esc(r.wrong_answer_2)}, ${esc(r.wrong_answer_3)},
        ${esc(r.youtube_title)}, ${esc(r.youtube_url)}, ${esc(r.video_url)},
        ${esc(r.category)}, ${esc(r.patreon_url)}, ${esc(r.quiz_type)}, ${esc(r.difficulty)},
        ${esc(r.explanation)}, ${esc(r.improvement_note)}, ${esc(r.notation_data)})`
    ).join(',\n');

    await sql(`INSERT INTO questions (set_id, question_number, question_text, correct_answer,
      wrong_answer_1, wrong_answer_2, wrong_answer_3, youtube_title, youtube_url, video_url,
      category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data)
      VALUES ${values}`);
    inserted += batch.length;
    if (inserted % 500 === 0 || inserted === validRows.length) console.log(`  ${inserted}/${validRows.length}`);
  }

  console.log(`Inserted ${inserted} questions`);

  const final = await sql`SELECT quiz_type, COUNT(*) as count FROM questions GROUP BY quiz_type ORDER BY count DESC`;
  console.log('FINAL:', JSON.stringify(final));
  const earCats = await sql`SELECT category, COUNT(*) as count FROM questions WHERE quiz_type = 'ear_training' GROUP BY category ORDER BY count DESC`;
  console.log('Ear training categories:', JSON.stringify(earCats));
}

main().catch(e => { console.error(e); process.exit(1); });
