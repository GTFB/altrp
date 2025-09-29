import { NextRequest, NextResponse } from 'next/server';
import { getSession, setToSession } from '@/lib/cookie-session';

export async function GET() {
  try {
    const session = getSession();
    return NextResponse.json(session?.data || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    setToSession(body.key, body.value);
    return NextResponse.json({success: true});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}
