import { neon } from '@neondatabase/serverless';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERROR: No database connection string found.');
  process.exit(1);
}

const sql = neon(connectionString);

async function main() {
  const csv1 = readFileSync('/home/runner/workspace/music_theory_questions.csv', 'utf-8');
  const csv2 = readFileSync('/home/runner/workspace/music_theory_questions_2.csv', 'utf-8');

  const records1 = parse(csv1, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });
  const records2 = parse(csv2, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });

  const emptyToNull = (val) => (!val || val.trim() === '') ? null : val.trim();

  const normalizeRow = (row) => ({
    set_id: row.set_id?.trim(),
    question_number: parseInt(row.question_number, 10),
    question_text: row.question_text?.trim(),
    correct_answer: row.correct_answer?.trim(),
    wrong_answer_1: row.wrong_answer_1?.trim(),
    wrong_answer_2: row.wrong_answer_2?.trim(),
    wrong_answer_3: row.wrong_answer_3?.trim(),
    category: row.category?.trim(),
    quiz_type: row.quiz_type?.trim() || 'music_theory',
    difficulty: row.difficulty?.trim(),
    explanation: row.explanation?.trim(),
    improvement_note: emptyToNull(row.improvement_note),
    youtube_url: emptyToNull(row.youtube_url),
    youtube_title: emptyToNull(row.youtube_title),
    video_url: row.video_url?.trim() || '',
    patreon_url: emptyToNull(row.patreon_url),
  });

  // Filter out rows with missing essential data
  const isValid = (r) => r.set_id && r.question_text && r.correct_answer && r.category;

  const all1 = records1.map(normalizeRow).filter(isValid);
  const all2 = records2.map(normalizeRow).filter(isValid);

  // Deduplicate: if same question_text exists in both sheets, keep v2 (richer schema)
  const seen = new Map();
  for (const r of all2) seen.set(r.question_text, r);
  for (const r of all1) {
    if (!seen.has(r.question_text)) seen.set(r.question_text, r);
  }
  const allRecords = Array.from(seen.values());

  console.log(`Sheet 1: ${all1.length} valid rows`);
  console.log(`Sheet 2: ${all2.length} valid rows`);
  console.log(`After dedup: ${allRecords.length} unique questions`);

  // Clear existing
  await sql`DELETE FROM questions WHERE quiz_type = 'music_theory'`;
  await sql`DELETE FROM quiz_sets WHERE quiz_type = 'music_theory'`;
  console.log('Cleared existing music_theory data.');

  // Collect unique set_ids
  const setMap = new Map();
  for (const row of allRecords) {
    if (!setMap.has(row.set_id)) {
      setMap.set(row.set_id, { category: row.category, count: 0 });
    }
    setMap.get(row.set_id).count++;
  }

  console.log(`Inserting ${setMap.size} quiz_sets...`);
  for (const [setId, meta] of setMap) {
    await sql`
      INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${setId}, 'music_theory', ${meta.category}, ${meta.count}, ${meta.category}, 'music_theory')
    `;
  }

  // Insert questions
  let inserted = 0;
  for (const row of allRecords) {
    await sql`
      INSERT INTO questions (
        set_id, question_number, question_text, correct_answer,
        wrong_answer_1, wrong_answer_2, wrong_answer_3,
        youtube_title, youtube_url, video_url,
        category, patreon_url, quiz_type, difficulty, explanation, improvement_note
      ) VALUES (
        ${row.set_id}, ${row.question_number}, ${row.question_text}, ${row.correct_answer},
        ${row.wrong_answer_1}, ${row.wrong_answer_2}, ${row.wrong_answer_3},
        ${row.youtube_title}, ${row.youtube_url}, ${row.video_url},
        ${row.category}, ${row.patreon_url}, ${row.quiz_type}, ${row.difficulty},
        ${row.explanation}, ${row.improvement_note}
      )
    `;
    inserted++;
    if (inserted % 100 === 0) console.log(`  ...${inserted}`);
  }

  console.log(`\nInserted ${inserted} questions.`);

  // Stats
  const byType = await sql`SELECT quiz_type, COUNT(*) as count FROM questions GROUP BY quiz_type`;
  console.log('All types:', JSON.stringify(byType));

  const byCat = await sql`SELECT category, COUNT(*) as count FROM questions WHERE quiz_type = 'music_theory' GROUP BY category ORDER BY count DESC`;
  console.log('Theory categories:', JSON.stringify(byCat));

  const byDiff = await sql`SELECT difficulty, COUNT(*) as count FROM questions WHERE quiz_type = 'music_theory' GROUP BY difficulty`;
  console.log('Difficulties:', JSON.stringify(byDiff));

  const withNote = await sql`SELECT COUNT(*) as count FROM questions WHERE quiz_type = 'music_theory' AND improvement_note IS NOT NULL`;
  console.log('With improvement_note:', withNote[0].count);
}

main().catch((err) => { console.error('Error:', err); process.exit(1); });
