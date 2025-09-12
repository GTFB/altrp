import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow root page to show language selection
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(ru|en)/:path*']
};
