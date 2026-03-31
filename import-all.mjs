import { neon } from '@neondatabase/serverless';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
const emptyToNull = (v) => (!v || v.trim() === '') ? null : v.trim();

async function importCSV(file, forceQuizType) {
  const csv = readFileSync(file, 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });
  const rows = records.filter(r => r.set_id && r.question_text && r.correct_answer);

  // Insert quiz_sets
  const setMap = new Map();
  for (const r of rows) {
    const qt = forceQuizType || r.quiz_type || 'music_theory';
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, { category: r.category, count: 0, qt });
    setMap.get(r.set_id).count++;
  }
  for (const [setId, meta] of setMap.entries()) {
    try {
      await sql`INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
        VALUES (${setId}, ${meta.qt}, ${meta.category}, ${meta.count}, ${meta.category}, ${meta.qt})`;
    } catch { /* duplicate set_id, skip */ }
  }

  // Insert questions
  let inserted = 0;
  for (const r of rows) {
    const qt = forceQuizType || r.quiz_type || 'music_theory';
    await sql`INSERT INTO questions (set_id, question_number, question_text, correct_answer,
      wrong_answer_1, wrong_answer_2, wrong_answer_3, youtube_title, youtube_url, video_url,
      category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data)
      VALUES (${r.set_id}, ${parseInt(r.question_number,10)||0}, ${r.question_text}, ${r.correct_answer},
      ${r.wrong_answer_1}, ${r.wrong_answer_2}, ${r.wrong_answer_3}, ${emptyToNull(r.youtube_title)},
      ${emptyToNull(r.youtube_url)}, ${r.video_url || ''}, ${r.category}, ${emptyToNull(r.patreon_url)},
      ${qt}, ${r.difficulty}, ${r.explanation}, ${emptyToNull(r.improvement_note)}, ${emptyToNull(r.notation_data)})`;
    inserted++;
    if (inserted % 200 === 0) console.log(`  ${file}: ${inserted}...`);
  }
  return inserted;
}

async function main() {
  // Clear all non-video data
  await sql`DELETE FROM questions WHERE quiz_type != 'ear_training'`;
  await sql`DELETE FROM quiz_sets WHERE quiz_type != 'ear_training' AND quiz_type IS NOT NULL`;
  console.log('Cleared non-video data');

  // Import each dataset
  const t1 = await importCSV('music_theory_questions.csv', 'music_theory');
  console.log(`Theory v1: ${t1}`);

  const t2 = await importCSV('music_theory_questions_2.csv', 'music_theory');
  console.log(`Theory v2: ${t2}`);

  const ind = await importCSV('indian_music.csv', 'indian_classical');
  console.log(`Indian: ${ind}`);

  const notation = await importCSV('staff_notation.csv', 'staff_notation');
  console.log(`Notation: ${notation}`);

  const ear = await importCSV('ear_training_text.csv', 'ear_training_text');
  console.log(`Ear training text: ${ear}`);

  // Verify
  const all = await sql`SELECT quiz_type, COUNT(*) as count FROM questions GROUP BY quiz_type ORDER BY count DESC`;
  let total = 0;
  console.log('\nFINAL COUNTS:');
  all.forEach(c => { console.log(`  ${c.quiz_type}: ${c.count}`); total += parseInt(c.count); });
  console.log(`  TOTAL: ${total}`);

  const withNotation = await sql`SELECT COUNT(*) as count FROM questions WHERE notation_data IS NOT NULL AND notation_data != ''`;
  console.log(`With notation_data: ${withNotation[0].count}`);
}

main().catch(e => { console.error(e); process.exit(1); });
