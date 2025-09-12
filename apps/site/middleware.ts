import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
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
    "/admin/:path*", 
    "/api/admin/:path*", 
    
  ],
};