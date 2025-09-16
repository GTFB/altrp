import { i18nConfig } from "@/config/i18n";
import { withAuth } from "next-auth/middleware";
import createMiddleware from 'next-intl/middleware';

const nextIntlMiddleware = createMiddleware(i18nConfig);

export default withAuth(
  async function middleware(req) {
    return nextIntlMiddleware(req);
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        const email = token?.email;

        if (!email) {
          return false;
        }

        if (req.nextUrl.pathname.startsWith("/admin")) {
          return token?.role === "admin"; 
        }
        return !!token;
      },
    },
  }
);

// See "Matching Paths" below to learn more
export const config = {
  matcher: [ 
    '/((?!api|_next/static|_next/image|favicon.ico).*)',    
  ],
};