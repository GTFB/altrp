import { i18nConfig } from "@/config/i18n";
import { withAuth } from "next-auth/middleware";
import createMiddleware from 'next-intl/middleware';

const nextIntlMiddleware = createMiddleware({
  ...i18nConfig,
  localePrefix: 'as-needed'

});

export default withAuth(
  async function middleware(req,res) {
    const excludedPaths = ['/api', '/admin', '/images', '/.well-known', '/login'];
    const pathname = req.nextUrl.pathname;
    
    const shouldExclude = excludedPaths.some(path => pathname.startsWith(path));
    
    if (shouldExclude) {
      return;
    }
    const fragments = req.nextUrl.pathname.split('/');


    
    return nextIntlMiddleware(req);
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        const email = token?.email;

        // if (!email) {
        //   return false;
        // }
        if (req.nextUrl.pathname.startsWith("/admin")) {
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