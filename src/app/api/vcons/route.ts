import { NextRequest, NextResponse } from 'next/server';
import { createVCon, listVCons } from '@/lib/vcon-client';
import { getDummyVCons } from '@/lib/dummy-data';
import type { VCon } from '@/types/vcon';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  try {
    const result = await listVCons(Math.min(limit, 100));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to list vCons';
    const isUnreachable = message.includes('unreachable') || message.includes('ECONNREFUSED');
    if (isUnreachable) {
      const dummyVcons = getDummyVCons(Math.min(limit, 100));
      return NextResponse.json({
        success: true,
        count: dummyVcons.length,
        limit,
        vcons: dummyVcons,
        _demo_mode: true,
        _message: 'vCon server unreachable — showing demo data with consent flow',
      });
    }
    console.error('List vCons error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<VCon>;
    const result = await createVCon(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Create vCon error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vCon' },
      { status: 500 }
    );
  }
}
