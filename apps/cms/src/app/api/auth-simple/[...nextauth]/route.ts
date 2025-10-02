import NextAuth from 'next-auth';

const simpleAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // GitHub only
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      {
        id: 'github',
        name: 'GitHub',
        type: 'oauth',
        authorization: {
          url: 'https://github.com/login/oauth/authorize',
          params: {
            scope: 'read:user user:email',
          },
        },
        token: 'https://github.com/login/oauth/access_token',
        userinfo: 'https://api.github.com/user',
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        profile(profile: any) {
          return {
            id: profile.id.toString(),
            name: profile.name || profile.login,
            email: profile.email,
            image: profile.avatar_url,
          };
        },
      }
    ] : []),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const handler = NextAuth(simpleAuthOptions);
export { handler as GET, handler as POST };
