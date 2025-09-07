import Google from 'next-auth/providers/google';
import { promises as fs } from 'fs';
import path from 'path';

const usersFilePath = path.join(process.cwd(), 'users.json');

async function ensureUsersFileExists(): Promise<void> {
  try {
    await fs.access(usersFilePath);
  } catch {
    await fs.writeFile(usersFilePath, JSON.stringify([] , null, 2), 'utf8');
  }
}

async function upsertUser(user: { id?: string | null; name?: string | null; email?: string | null; image?: string | null }): Promise<void> {
  await ensureUsersFileExists();
  const content = await fs.readFile(usersFilePath, 'utf8');
  const list: Array<{ id?: string | null; name?: string | null; email?: string | null; image?: string | null }> = content ? JSON.parse(content) : [];
  const existingIdx = list.findIndex((u) => u.email && u.email === user.email);
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...user };
  } else {
    list.push(user);
  }
  await fs.writeFile(usersFilePath, JSON.stringify(list, null, 2), 'utf8');
}

export const authOptions = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  events: {
    async signIn({ user }: { user: { id?: string | null; name?: string | null; email?: string | null; image?: string | null } }) {
      try {
        await upsertUser(user);
      } catch (e) {
        console.error('Failed to persist user to users.json', e);
      }
    },
  },
} as const;
