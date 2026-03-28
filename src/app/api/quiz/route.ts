import { NextRequest, NextResponse } from 'next/server';
import { getAllSets, getSetById, getQuestionsBySetId, getRandomQuestions, getQuizStats } from '@/lib/queries';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const setId = searchParams.get('setId');
    const random = searchParams.get('random');
    const count = searchParams.get('count');
    const stats = searchParams.get('stats');

    // Get quiz statistics
    if (stats === 'true') {
      const quizStats = await getQuizStats();
      return NextResponse.json({
        success: true,
        data: quizStats,
      });
    }

    // Get random questions
    if (random === 'true') {
      const questionCount = Math.min(parseInt(count || '10'), 100);
      if (questionCount < 1) {
        return NextResponse.json(
          { success: false, error: 'Count must be at least 1' },
          { status: 400 }
        );
      }

      const questions = await getRandomQuestions(questionCount);
      return NextResponse.json({
        success: true,
        data: {
          mode: 'random',
          count: questions.length,
          questions,
        },
      });
    }

    // Get set by ID with all questions
    if (setId) {
      const set = await getSetById(setId);
      if (!set) {
        return NextResponse.json(
          { success: false, error: `Quiz set '${setId}' not found` },
          { status: 404 }
        );
      }

      const questions = await getQuestionsBySetId(setId);
      return NextResponse.json({
        success: true,
        data: {
          set,
          questions,
          count: questions.length,
        },
      });
    }

    // Get all sets
    const allSets = await getAllSets();
    return NextResponse.json({
      success: true,
      data: {
        count: allSets.length,
        sets: allSets,
      },
    });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
