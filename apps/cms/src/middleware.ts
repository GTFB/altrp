import { i18nConfig } from "@/config/i18n";
import { withAuth } from "next-auth/middleware";
import createMiddleware from 'next-intl/middleware';

const nextIntlMiddleware = createMiddleware({
  ...i18nConfig,
  localePrefix: 'as-needed'

});

export default withAuth(
  async function middleware(req,res) {
    const excludedPaths = ['/api',  '/images', '/.well-known', ];
    const pathname = req.nextUrl.pathname;
    req.headers.set('x-pathname', pathname);
    
    const shouldExclude = excludedPaths.some(path => pathname.startsWith(path));
    if (shouldExclude) {
      return;
    }

    
    return nextIntlMiddleware(req);
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        // E2E Test bypass: Check for test cookie in development
        // Requires both NODE_ENV=development AND E2E_TESTING=true
        if (process.env.NODE_ENV === 'development' && process.env.E2E_TESTING === 'true') {
          const e2eTestCookie = req.cookies.get('e2e-test-admin');
          if (e2eTestCookie?.value) {
            // Validate cookie format: email:token
            const [email] = e2eTestCookie.value.split(':');
            if (email) {
              console.log('🧪 E2E Test: Bypassing auth for:', email.substring(0, 3) + '***');
              return true; // Allow access for E2E tests
            }
          }
        }

        const email = token?.email;

        // if (!email) {
        //   return false;
        // }
        if (req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/api/admin")) {
          return token?.role === "admin"; 
        }
        return true;
      },
    },
  }
);

// See "Matching Paths" below to learn more
export const config = {
  matcher: [ 
    '/((?!_next/static|_next/image|favicon.ico).*)',    
  ],
};