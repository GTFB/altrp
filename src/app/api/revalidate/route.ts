import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  const { path } = await req.json();
  revalidatePath(path);
  return new Response('OK');
}
