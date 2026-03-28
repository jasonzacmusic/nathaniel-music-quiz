import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  try {
    const result = await sql`
      SELECT
        id,
        name,
        email,
        phone,
        instrument,
        message,
        created_at
      FROM leads
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Admin leads API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
