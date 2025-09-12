import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { promises as fs } from 'fs';
import path from 'path';
import { isUserAdmin } from '@/lib/admin-manager';

const dbFilePath = path.join(process.cwd(), '../..', 'db.json');


async function ensureDbFileExists(): Promise<void> {
  try {
    await fs.access(dbFilePath);
  } catch {
    const initialData = { users: [] };
    await fs.writeFile(dbFilePath, JSON.stringify(initialData, null, 2), 'utf8');
  }
}

async function upsertUser(user: { id?: string | null; name?: string | null; email?: string | null; image?: string | null }): Promise<void> {
  await ensureDbFileExists();
  const content = await fs.readFile(dbFilePath, 'utf8');
  const data = content ? JSON.parse(content) : { users: [] };
  
  if (!Array.isArray(data.users)) {
    data.users = [];
  }
  
  const existingIdx = data.users.findIndex((u: any) => u.email === user.email);
  if (existingIdx >= 0) {
    data.users[existingIdx] = { ...data.users[existingIdx], ...user };
  } else {
    data.users.push({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image
    });
  }
  
  await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
}

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Add only configured providers
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      })
    ] : []),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn({ user }: { user: any }) {
      try {
        await upsertUser(user);
      } catch (e) {
        console.error('Failed to persist user to db.json', e);
      }
    },
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        const isAdmin = await isUserAdmin(user.email as string);
        token.role = isAdmin ? 'admin' : 'user';
        token.id = user.id;
        user.id = user.id;
      }
      return token;
    },
  },
};

// Export auth function for server-side usage
export const { auth, signIn, signOut } = NextAuth(authOptions);

