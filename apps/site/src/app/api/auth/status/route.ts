import { NextResponse } from 'next/server';
import { authOptions } from '@/config/auth';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      config: {
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        hasGitHub: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        hasGoogle: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        providersCount: authOptions.providers.length,
        sessionStrategy: authOptions.session?.strategy,
      }
    });
  } catch (error) {
    console.error('Auth status error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
