import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/queries';
import { isValidEmail } from '@/lib/utils';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, instrument, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate optional fields
    if (phone && (typeof phone !== 'string' || phone.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Phone must be a non-empty string if provided' },
        { status: 400 }
      );
    }

    if (instrument && (typeof instrument !== 'string' || instrument.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Instrument must be a non-empty string if provided' },
        { status: 400 }
      );
    }

    if (message && (typeof message !== 'string' || message.trim().length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Message must be a non-empty string if provided' },
        { status: 400 }
      );
    }

    // Save lead to database
    await saveLead({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : undefined,
      instrument: instrument ? instrument.trim() : undefined,
      message: message ? message.trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Lead saved successfully',
        name: name.trim(),
        email: email.trim(),
      },
    });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
