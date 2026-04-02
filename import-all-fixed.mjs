import { neon } from '@neondatabase/serverless';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
const emptyToNull = (v) => (!v || v.trim() === '') ? null : v.trim();

async function importCSV(file, forceQuizType) {
  const csv = readFileSync(file, 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });
  const rows = records.filter(r => r.set_id && r.question_text && r.correct_answer);

  // Collect unique set_ids
  const setMap = new Map();
  for (const r of rows) {
    const qt = forceQuizType || r.quiz_type || 'music_theory';
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, { category: r.category, count: 0, qt });
    setMap.get(r.set_id).count++;
  }

  // Insert quiz_sets first, wait for all to complete
  let setsInserted = 0;
  for (const [setId, meta] of setMap.entries()) {
    await sql`INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${setId}, ${meta.qt}, ${meta.category}, ${meta.count}, ${meta.category}, ${meta.qt})
      ON CONFLICT (set_id) DO UPDATE SET num_questions = EXCLUDED.num_questions, category = EXCLUDED.category, quiz_type = EXCLUDED.quiz_type`;
    setsInserted++;
  }
  console.log(`  ${file}: ${setsInserted} sets created`);

  // Insert questions
  let inserted = 0;
  let errors = 0;
  for (const r of rows) {
    const qt = forceQuizType || r.quiz_type || 'music_theory';
    try {
      await sql`INSERT INTO questions (set_id, question_number, question_text, correct_answer,
        wrong_answer_1, wrong_answer_2, wrong_answer_3, youtube_title, youtube_url, video_url,
        category, patreon_url, quiz_type, difficulty, explanation, improvement_note, notation_data)
        VALUES (${r.set_id}, ${parseInt(r.question_number,10)||0}, ${r.question_text}, ${r.correct_answer},
        ${r.wrong_answer_1||''}, ${r.wrong_answer_2||''}, ${r.wrong_answer_3||''}, ${emptyToNull(r.youtube_title)},
        ${emptyToNull(r.youtube_url)}, ${r.video_url || ''}, ${r.category}, ${emptyToNull(r.patreon_url)},
        ${qt}, ${r.difficulty||'beginner'}, ${r.explanation||''}, ${emptyToNull(r.improvement_note)}, ${emptyToNull(r.notation_data)})`;
      inserted++;
    } catch (e) {
      errors++;
      if (errors <= 3) console.error(`  Error on ${r.set_id}: ${e.message}`);
    }
    if (inserted % 200 === 0 && inserted > 0) console.log(`  ${file}: ${inserted} questions...`);
  }
  if (errors > 0) console.log(`  ${file}: ${errors} errors`);
  return inserted;
}

async function main() {
  // Clear all non-video data (preserve ear_training)
  await sql`DELETE FROM questions WHERE quiz_type != 'ear_training'`;
  await sql`DELETE FROM quiz_sets WHERE quiz_type != 'ear_training'`;
  console.log('Cleared non-video data (preserved ear_training)');

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
}

main().catch(e => { console.error(e); process.exit(1); });
