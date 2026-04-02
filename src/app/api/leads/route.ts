import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { saveLead } from '@/lib/queries';
import { isValidEmail } from '@/lib/utils';
import { appendToSheet } from '@/lib/google-sheets';
import { buildConfirmationEmail } from '@/lib/emails/confirmation';
import { buildInternalNotificationEmail } from '@/lib/emails/internal-notification';

export const runtime = 'edge';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Also append to Google Sheets (await it so Vercel Edge doesn't kill it before completion)
    const leadId = crypto.randomUUID();
    try {
      await appendToSheet('Quiz', [
        new Date().toISOString(),
        name.trim(),
        email.trim(),
        phone ? phone.trim() : '',
        instrument ? instrument.trim() : '',
        message ? message.trim() : '',
        leadId,
      ]);
    } catch (err) {
      console.error('Sheet append failed:', err);
      // We don't throw here so the user still gets a success response since the DB save worked
    }

    // Send confirmation email via Resend
    try {
      const { html, text } = buildConfirmationEmail(name.trim(), phone ? phone.trim() : undefined);
      const emailResult = await resend.emails.send({
        from: 'Nathaniel School of Music <music@notifications.nathanielschool.com>',
        to: email.trim(),
        subject: 'Thank you for reaching out — Nathaniel School of Music',
        html,
        text,
      });
      console.log('Resend confirmation result:', JSON.stringify(emailResult));
    } catch (err) {
      console.error('Resend confirmation email failed:', err);
    }

    // Send internal notification to music@nathanielschool.com
    try {
      const { html: internalHtml, text: internalText } = buildInternalNotificationEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone ? phone.trim() : undefined,
        instrument: instrument ? instrument.trim() : undefined,
        message: message ? message.trim() : undefined,
      });
      const internalResult = await resend.emails.send({
        from: 'Nathaniel School of Music <music@notifications.nathanielschool.com>',
        to: 'music@nathanielschool.com',
        subject: `New Form Submission — ${name.trim()}`,
        html: internalHtml,
        text: internalText,
      });
      console.log('Resend internal result:', JSON.stringify(internalResult));
    } catch (err) {
      console.error('Resend internal notification failed:', err);
    }

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
