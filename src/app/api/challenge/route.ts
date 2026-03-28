import { NextRequest, NextResponse } from 'next/server';
import { getChallengeQuestions } from '@/lib/queries';
import { shuffleArray } from '@/lib/utils';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count, categories, difficulty } = body;

    // Validate input
    if (!count || typeof count !== 'number' || count < 1 || count > 100) {
      return NextResponse.json(
        { success: false, error: 'Count must be a number between 1 and 100' },
        { status: 400 }
      );
    }

    if (categories && !Array.isArray(categories)) {
      return NextResponse.json(
        { success: false, error: 'Categories must be an array' },
        { status: 400 }
      );
    }

    // Get challenge questions
    const questions = await getChallengeQuestions(
      count,
      categories || [],
      difficulty
    );

    // Shuffle the questions array for variety
    const shuffledQuestions = shuffleArray(questions);

    return NextResponse.json({
      success: true,
      data: {
        mode: 'challenge',
        count: shuffledQuestions.length,
        criteria: {
          requested_count: count,
          categories: categories || [],
          difficulty: difficulty || 'all',
        },
        questions: shuffledQuestions,
      },
    });
  } catch (error) {
    console.error('Challenge API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
