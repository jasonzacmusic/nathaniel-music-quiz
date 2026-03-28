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

    const isAuthenticated = password === adminPassword;

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
