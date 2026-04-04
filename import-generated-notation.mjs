#!/usr/bin/env node
/**
 * Import generated notation questions into Neon DB.
 * Only touches gen-* set_ids — safe to run alongside existing data.
 */

import { neon } from '@neondatabase/serverless';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';

const sql = neon(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
const emptyToNull = (v) => (!v || v.trim() === '') ? null : v.trim();

async function main() {
  const csv = readFileSync('staff_notation_generated.csv', 'utf-8');
  const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true, relax_column_count: true });
  const rows = records.filter(r => r.set_id && r.question_text && r.correct_answer);

  console.log(`Parsed ${rows.length} questions from CSV`);

  // Delete old generated questions
  const deleted = await sql`DELETE FROM questions WHERE set_id LIKE 'gen-%' AND quiz_type = 'staff_notation'`;
  console.log(`Deleted old gen-* questions`);

  await sql`DELETE FROM quiz_sets WHERE set_id LIKE 'gen-%' AND quiz_type = 'staff_notation'`;
  console.log(`Deleted old gen-* quiz sets`);

  // Insert quiz_sets
  const setMap = new Map();
  for (const r of rows) {
    if (!setMap.has(r.set_id)) setMap.set(r.set_id, { category: r.category, count: 0 });
    setMap.get(r.set_id).count++;
  }

  for (const [setId, meta] of setMap.entries()) {
    await sql`INSERT INTO quiz_sets (set_id, quiz_mode, original_title, num_questions, category, quiz_type)
      VALUES (${setId}, ${'staff_notation'}, ${meta.category}, ${meta.count}, ${meta.category}, ${'staff_notation'})
      ON CONFLICT (set_id) DO UPDATE SET num_questions = EXCLUDED.num_questions, category = EXCLUDED.category, quiz_type = EXCLUDED.quiz_type`;
  }
  console.log(`Upserted ${setMap.size} quiz sets`);

  // Batch insert questions (50 at a time for performance)
  let inserted = 0;
  for (const r of rows) {
    await sql`INSERT INTO questions (set_id, question_number, question_text, correct_answer,
      wrong_answer_1, wrong_answer_2, wrong_answer_3,
      category, quiz_type, difficulty, explanation, improvement_note, notation_data)
      VALUES (${r.set_id}, ${parseInt(r.question_number, 10) || 0}, ${r.question_text}, ${r.correct_answer},
      ${r.wrong_answer_1 || ''}, ${r.wrong_answer_2 || ''}, ${r.wrong_answer_3 || ''},
      ${r.category}, ${'staff_notation'}, ${r.difficulty || 'beginner'},
      ${emptyToNull(r.explanation)}, ${emptyToNull(r.improvement_note)}, ${emptyToNull(r.notation_data)})`;
    inserted++;
    if (inserted % 100 === 0) console.log(`  Inserted ${inserted}/${rows.length}...`);
  }

  console.log(`\nInserted ${inserted} questions total`);

  // Verify
  const counts = await sql`
    SELECT category, difficulty, COUNT(*) as count
    FROM questions
    WHERE quiz_type = 'staff_notation' AND set_id LIKE 'gen-%'
    GROUP BY category, difficulty
    ORDER BY category, difficulty
  `;

  console.log('\n=== Generated Questions in DB ===');
  let total = 0;
  let currentCat = '';
  for (const row of counts) {
    if (row.category !== currentCat) {
      currentCat = row.category;
      console.log(`\n${currentCat}:`);
    }
    console.log(`  ${row.difficulty}: ${row.count}`);
    total += parseInt(row.count);
  }
  console.log(`\nTotal generated: ${total}`);

  // Show total notation questions (including originals)
  const allNotation = await sql`SELECT COUNT(*) as count FROM questions WHERE quiz_type = 'staff_notation'`;
  console.log(`Total notation questions (generated + original): ${allNotation[0].count}`);
}

main().catch(e => { console.error(e); process.exit(1); });
