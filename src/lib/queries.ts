import sql from './db';
import { shuffleArray } from './utils';

export interface QuizSet {
  set_id: string;
  quiz_mode: string;
  original_title: string;
  num_questions: number;
  category: string;
  upload_date: string;
  status: string;
  apple_notes_title: string;
  quiz_type: string;
  created_at: string;
}

export interface Question {
  id: number;
  set_id: string;
  question_number: number;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  youtube_title: string;
  youtube_url: string;
  video_url: string;
  category: string;
  patreon_url: string;
  quiz_type: string;
  difficulty: string | null;
  explanation: string | null;
  created_at: string;
}

export interface QuestionWithShuffledAnswers extends Question {
  answers: string[];
}

export interface Category {
  category: string;
  count: number;
}

export interface OverlaySettings {
  set_id: string;
  height: number;
  offset: number;
  opacity: number;
  blur: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  name: string;
  email: string;
  phone?: string;
  instrument?: string;
  message?: string;
}

export interface QuizStats {
  total_sets: number;
  total_questions: number;
  categories_count: number;
}

/**
 * Get all quiz sets ordered by set_id
 */
export async function getAllSets(): Promise<QuizSet[]> {
  const result = await sql`
    SELECT
      set_id,
      quiz_mode,
      original_title,
      num_questions,
      category,
      upload_date,
      status,
      apple_notes_title,
      created_at
    FROM quiz_sets
    ORDER BY set_id ASC
  `;
  return result as QuizSet[];
}

/**
 * Get a single quiz set by ID
 */
export async function getSetById(setId: string): Promise<QuizSet | null> {
  const result = await sql`
    SELECT
      set_id,
      quiz_mode,
      original_title,
      num_questions,
      category,
      upload_date,
      status,
      apple_notes_title,
      created_at
    FROM quiz_sets
    WHERE set_id = ${setId}
  `;
  return result.length > 0 ? (result[0] as QuizSet) : null;
}

/**
 * Get all questions for a set, ordered by question_number
 * Returns questions with shuffled answers
 */
export async function getQuestionsBySetId(setId: string): Promise<QuestionWithShuffledAnswers[]> {
  const result = await sql`
    SELECT
      id,
      set_id,
      question_number,
      question_text,
      correct_answer,
      wrong_answer_1,
      wrong_answer_2,
      wrong_answer_3,
      youtube_title,
      youtube_url,
      video_url,
      category,
      patreon_url,
      created_at
    FROM questions
    WHERE set_id = ${setId}
    ORDER BY question_number ASC
  `;

  // Shuffle answers for each question
  const questions = result as Question[];
  return questions.map((q) => {
    const answers = [q.correct_answer, q.wrong_answer_1, q.wrong_answer_2, q.wrong_answer_3].filter(Boolean);
    // Fisher-Yates shuffle
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return { ...q, answers };
  });
}

/**
 * Get random questions, optionally filtered by category
 */
export async function getRandomQuestions(
  count: number,
  category?: string
): Promise<QuestionWithShuffledAnswers[]> {
  let result;

  if (category) {
    result = await sql`
      SELECT
        id,
        set_id,
        question_number,
        question_text,
        correct_answer,
        wrong_answer_1,
        wrong_answer_2,
        wrong_answer_3,
        youtube_title,
        youtube_url,
        video_url,
        category,
        patreon_url,
        created_at
      FROM questions
      WHERE category = ${category} AND quiz_type = 'ear_training'
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  } else {
    result = await sql`
      SELECT
        id,
        set_id,
        question_number,
        question_text,
        correct_answer,
        wrong_answer_1,
        wrong_answer_2,
        wrong_answer_3,
        youtube_title,
        youtube_url,
        video_url,
        category,
        patreon_url,
        created_at
      FROM questions
      WHERE quiz_type = 'ear_training'
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  }

  const questions = result as Question[];
  return questions.map((q) => {
    const answers = [q.correct_answer, q.wrong_answer_1, q.wrong_answer_2, q.wrong_answer_3].filter(Boolean);
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return { ...q, answers };
  });
}

/**
 * Get distinct categories with counts
 */
export async function getCategories(): Promise<Category[]> {
  const result = await sql`
    SELECT
      category,
      COUNT(*) as count
    FROM questions
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY count DESC
  `;
  return result as unknown as Category[];
}

/**
 * Get quiz sets that contain questions in a given category
 */
export async function getSetsByCategory(categoryName: string): Promise<QuizSet[]> {
  const result = await sql`
    SELECT DISTINCT
      qs.set_id,
      qs.quiz_mode,
      qs.original_title,
      qs.num_questions,
      qs.category,
      qs.upload_date,
      qs.status,
      qs.apple_notes_title,
      qs.created_at
    FROM quiz_sets qs
    INNER JOIN questions q ON q.set_id = qs.set_id
    WHERE q.category = ${categoryName}
    ORDER BY qs.created_at DESC
  `;
  return result as QuizSet[];
}

/**
 * Get random questions from a specific category
 */
export async function getQuestionsByCategory(
  categoryName: string,
  count: number = 10
): Promise<QuestionWithShuffledAnswers[]> {
  const result = await sql`
    SELECT
      id, set_id, question_number, question_text,
      correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3,
      youtube_title, youtube_url, video_url, category, patreon_url, created_at
    FROM questions
    WHERE category = ${categoryName}
    ORDER BY RANDOM()
    LIMIT ${count}
  `;

  return (result as unknown as Question[]).map((q) => ({
    ...q,
    answers: shuffleArray([
      q.correct_answer,
      q.wrong_answer_1,
      q.wrong_answer_2,
      q.wrong_answer_3,
    ].filter(Boolean)),
  }));
}

/**
 * Get questions for custom challenge
 * Accepts an array of categories and optional difficulty
 */
export async function getChallengeQuestions(
  count: number,
  categories: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _difficulty?: string
): Promise<QuestionWithShuffledAnswers[]> {
  let result;

  if (categories.length === 0) {
    result = await sql`
      SELECT
        id,
        set_id,
        question_number,
        question_text,
        correct_answer,
        wrong_answer_1,
        wrong_answer_2,
        wrong_answer_3,
        youtube_title,
        youtube_url,
        video_url,
        category,
        patreon_url,
        created_at
      FROM questions
      WHERE quiz_type = 'ear_training'
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  } else {
    result = await sql`
      SELECT
        id,
        set_id,
        question_number,
        question_text,
        correct_answer,
        wrong_answer_1,
        wrong_answer_2,
        wrong_answer_3,
        youtube_title,
        youtube_url,
        video_url,
        category,
        patreon_url,
        created_at
      FROM questions
      WHERE category = ANY(${categories}) AND quiz_type = 'ear_training'
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  }

  const questions = result as Question[];
  return questions.map((q) => {
    const answers = [q.correct_answer, q.wrong_answer_1, q.wrong_answer_2, q.wrong_answer_3].filter(Boolean);
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return { ...q, answers };
  });
}

/**
 * Get theory quiz categories
 */
export async function getTheoryCategories(): Promise<Category[]> {
  const result = await sql`
    SELECT
      category,
      COUNT(*) as count
    FROM questions
    WHERE quiz_type = 'music_theory' AND category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY count DESC
  `;
  return result as unknown as Category[];
}

/**
 * Get theory questions with optional difficulty and category filters
 */
export async function getTheoryQuestions(
  count: number,
  difficulty?: string,
  category?: string
): Promise<QuestionWithShuffledAnswers[]> {
  let result;

  if (difficulty && category) {
    result = await sql`
      SELECT id, set_id, question_number, question_text,
        correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3,
        youtube_title, youtube_url, video_url, category, patreon_url,
        quiz_type, difficulty, explanation, created_at
      FROM questions
      WHERE quiz_type = 'music_theory' AND difficulty = ${difficulty} AND category = ${category}
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  } else if (difficulty) {
    result = await sql`
      SELECT id, set_id, question_number, question_text,
        correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3,
        youtube_title, youtube_url, video_url, category, patreon_url,
        quiz_type, difficulty, explanation, created_at
      FROM questions
      WHERE quiz_type = 'music_theory' AND difficulty = ${difficulty}
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  } else if (category) {
    result = await sql`
      SELECT id, set_id, question_number, question_text,
        correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3,
        youtube_title, youtube_url, video_url, category, patreon_url,
        quiz_type, difficulty, explanation, created_at
      FROM questions
      WHERE quiz_type = 'music_theory' AND category = ${category}
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  } else {
    result = await sql`
      SELECT id, set_id, question_number, question_text,
        correct_answer, wrong_answer_1, wrong_answer_2, wrong_answer_3,
        youtube_title, youtube_url, video_url, category, patreon_url,
        quiz_type, difficulty, explanation, created_at
      FROM questions
      WHERE quiz_type = 'music_theory'
      ORDER BY RANDOM()
      LIMIT ${count}
    `;
  }

  return (result as unknown as Question[]).map((q) => ({
    ...q,
    answers: shuffleArray([
      q.correct_answer,
      q.wrong_answer_1,
      q.wrong_answer_2,
      q.wrong_answer_3,
    ].filter(Boolean)),
  }));
}

/**
 * Get theory quiz stats
 */
export async function getTheoryStats(): Promise<{ total_questions: number; categories_count: number; difficulties: { difficulty: string; count: number }[] }> {
  const questionsResult = await sql`SELECT COUNT(*) as count FROM questions WHERE quiz_type = 'music_theory'`;
  const categoriesResult = await sql`SELECT COUNT(DISTINCT category) as count FROM questions WHERE quiz_type = 'music_theory' AND category IS NOT NULL AND category != ''`;
  const difficultiesResult = await sql`
    SELECT difficulty, COUNT(*) as count FROM questions
    WHERE quiz_type = 'music_theory' AND difficulty IS NOT NULL
    GROUP BY difficulty ORDER BY difficulty
  `;

  return {
    total_questions: (questionsResult[0] as { count: number }).count,
    categories_count: (categoriesResult[0] as { count: number }).count,
    difficulties: difficultiesResult as unknown as { difficulty: string; count: number }[],
  };
}

/**
 * Save a contact form submission (lead)
 */
export async function saveLead(lead: Lead): Promise<void> {
  await sql`
    INSERT INTO leads (name, email, phone, instrument, message, created_at)
    VALUES (${lead.name}, ${lead.email}, ${lead.phone || null}, ${lead.instrument || null}, ${lead.message || null}, NOW())
  `;
}

/**
 * Get quiz statistics
 */
export async function getQuizStats(): Promise<QuizStats> {
  const setsResult = await sql`
    SELECT COUNT(*) as count FROM quiz_sets
  `;
  const questionsResult = await sql`
    SELECT COUNT(*) as count FROM questions
  `;
  const categoriesResult = await sql`
    SELECT COUNT(DISTINCT category) as count FROM questions WHERE category IS NOT NULL AND category != ''
  `;

  return {
    total_sets: (setsResult[0] as { count: number }).count,
    total_questions: (questionsResult[0] as { count: number }).count,
    categories_count: (categoriesResult[0] as { count: number }).count,
  };
}

/**
 * Create overlay_settings table if it doesn't exist
 */
export async function initializeOverlayTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS overlay_settings (
      set_id TEXT PRIMARY KEY,
      height INT DEFAULT 300,
      offset INT DEFAULT 0,
      opacity DECIMAL DEFAULT 1.0,
      blur INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

/**
 * Get overlay settings for a quiz set
 */
export async function getOverlaySettings(setId: string): Promise<OverlaySettings | null> {
  const result = await sql`
    SELECT
      set_id,
      height,
      offset,
      opacity,
      blur,
      created_at,
      updated_at
    FROM overlay_settings
    WHERE set_id = ${setId}
  `;
  return result.length > 0 ? (result[0] as OverlaySettings) : null;
}

/**
 * Save or update overlay settings
 */
export async function saveOverlaySettings(setId: string, settings: {
  height: number;
  offset: number;
  opacity: number;
  blur: number;
}): Promise<void> {
  await sql`
    INSERT INTO overlay_settings (set_id, height, offset, opacity, blur, created_at, updated_at)
    VALUES (${setId}, ${settings.height}, ${settings.offset}, ${settings.opacity}, ${settings.blur}, NOW(), NOW())
    ON CONFLICT (set_id) DO UPDATE SET
      height = EXCLUDED.height,
      offset = EXCLUDED.offset,
      opacity = EXCLUDED.opacity,
      blur = EXCLUDED.blur,
      updated_at = NOW()
  `;
}
