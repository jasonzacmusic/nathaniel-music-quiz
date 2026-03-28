import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || !token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Constant-time comparison to prevent timing attacks
  const encoder = new TextEncoder();
  const tokenBytes = encoder.encode(token);
  const passwordBytes = encoder.encode(adminPassword);
  const len = Math.max(tokenBytes.length, passwordBytes.length);
  const a = new Uint8Array(len);
  const b = new Uint8Array(len);
  a.set(tokenBytes);
  b.set(passwordBytes);
  let diff = tokenBytes.length === passwordBytes.length ? 0 : 1;
  for (let i = 0; i < len; i++) diff |= a[i] ^ b[i];
  if (diff !== 0) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

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
