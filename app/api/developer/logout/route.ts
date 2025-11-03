import { NextRequest, NextResponse } from 'next/server';
import { destroyDeveloperSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  destroyDeveloperSession();
  return NextResponse.json({ success: true });
}
