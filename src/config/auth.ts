import Google from 'next-auth/providers/google';
import { promises as fs } from 'fs';
import path from 'path';

const dbFilePath = path.join(process.cwd(), 'db.json');

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
        console.error('Failed to persist user to db.json', e);
      }
    },
  },
} as const;

