import { NextRequest, NextResponse } from 'next/server';
import { getOverlaySettings, saveOverlaySettings, initializeOverlayTable } from '@/lib/queries';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const setId = searchParams.get('setId');

    if (!setId) {
      return NextResponse.json(
        { success: false, error: 'setId parameter is required' },
        { status: 400 }
      );
    }

    const settings = await getOverlaySettings(setId);

    if (!settings) {
      // Return default settings if not found
      return NextResponse.json({
        success: true,
        data: {
          set_id: setId,
          height: 300,
          offset: 0,
          opacity: 1.0,
          blur: 0,
          isDefault: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('Overlay GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize table on first use
    await initializeOverlayTable();

    const body = await request.json();
    const { setId, height, offset, opacity, blur } = body;

    // Validate input
    if (!setId) {
      return NextResponse.json(
        { success: false, error: 'setId is required' },
        { status: 400 }
      );
    }

    if (typeof height !== 'number' || height < 0) {
      return NextResponse.json(
        { success: false, error: 'height must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof offset !== 'number') {
      return NextResponse.json(
        { success: false, error: 'offset must be a number' },
        { status: 400 }
      );
    }

    if (typeof opacity !== 'number' || opacity < 0 || opacity > 1) {
      return NextResponse.json(
        { success: false, error: 'opacity must be a number between 0 and 1' },
        { status: 400 }
      );
    }

    if (typeof blur !== 'number' || blur < 0) {
      return NextResponse.json(
        { success: false, error: 'blur must be a non-negative number' },
        { status: 400 }
      );
    }

    // Save settings
    await saveOverlaySettings(setId, { height, offset, opacity, blur });

    return NextResponse.json({
      success: true,
      data: {
        set_id: setId,
        height,
        offset,
        opacity,
        blur,
        message: 'Overlay settings saved successfully',
      },
    });
  } catch (error) {
    console.error('Overlay POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
