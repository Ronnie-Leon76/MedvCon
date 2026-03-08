import { NextResponse } from 'next/server';
import { healthCheck } from '@/lib/vcon-client';

export async function GET() {
  try {
    const result = await healthCheck();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', database: 'error', error: String(error) },
      { status: 503 }
    );
  }
}
