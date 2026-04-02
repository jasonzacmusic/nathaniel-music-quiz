import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const connStr = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL!;
    const sql = neon(connStr);

    // Debug: check all quiz types
    const types = await sql`SELECT quiz_type, COUNT(*) as count FROM questions GROUP BY quiz_type ORDER BY count DESC`;

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
      debug: { types, connStr: connStr.substring(0, 30) + "..." }
    });
  } catch (error) {
    console.error('Categories API error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
