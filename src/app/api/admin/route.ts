import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Validate input
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    // Check password against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable is not set');
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: 'Admin authentication is not configured',
        },
        { status: 500 }
      );
    }

    // Constant-time comparison to prevent timing attacks
    const encoder = new TextEncoder();
    const passwordBytes = encoder.encode(password);
    const adminPasswordBytes = encoder.encode(adminPassword);
    const len = Math.max(passwordBytes.length, adminPasswordBytes.length);
    const a = new Uint8Array(len);
    const b = new Uint8Array(len);
    a.set(passwordBytes);
    b.set(adminPasswordBytes);
    let diff = passwordBytes.length === adminPasswordBytes.length ? 0 : 1;
    for (let i = 0; i < len; i++) diff |= a[i] ^ b[i];
    const isAuthenticated = diff === 0;

    if (!isAuthenticated) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        message: 'Invalid password',
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      message: 'Authentication successful',
    });
  } catch (error) {
    console.error('Admin authentication error:', error);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
