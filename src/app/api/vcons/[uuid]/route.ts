import { NextRequest, NextResponse } from 'next/server';
import { getVCon } from '@/lib/vcon-client';
import { getDummyVCon } from '@/lib/dummy-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;
    const result = await getVCon(uuid);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch vCon';
    const isUnreachable = message.includes('unreachable') || message.includes('ECONNREFUSED');
    if (isUnreachable) {
      const dummyVcon = getDummyVCon(uuid);
      if (dummyVcon) {
        return NextResponse.json({
          success: true,
          vcon: dummyVcon,
          _demo_mode: true,
          _message: 'vCon server unreachable — showing demo data',
        });
      }
    }
    console.error('Get vCon error:', error);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
