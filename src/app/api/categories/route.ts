import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await sql`
      SELECT category, COUNT(*) as count
      FROM questions
      WHERE category IS NOT NULL AND category != '' AND quiz_type = 'ear_training'
      GROUP BY category
      ORDER BY count DESC
    `;

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
