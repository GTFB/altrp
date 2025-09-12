import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow root page to show language selection
  if (pathname === '/') {
    return NextResponse.next();
  }
  
  // Protect admin routes - redirect to login
  // The actual admin authentication will be handled by AdminGuard component
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Check if user has a session cookie
    const sessionToken = request.cookies.get('authjs.session-token') || 
                        request.cookies.get('__Secure-authjs.session-token');
    
    if (!sessionToken) {
      // Redirect to login if no session
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // If session exists, let the page/component handle admin verification
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/(ru|en)/:path*', '/admin/:path*', '/api/admin/:path*']
};
