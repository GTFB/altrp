import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { RenderMdx } from '@/lib/mdx';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export default async function Page({ params }: PageProps) {
  const filePath = path.join(process.cwd(), 'content', 'pages', `${params.slug}.mdx`);
  
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(raw);
    
    return (
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
          {data.description && (
            <p className="text-xl text-muted-foreground">{data.description}</p>
          )}
        </header>
        
        <div className="prose prose-lg max-w-none">
          <RenderMdx source={{ compiledSource: content }} />
        </div>
      </article>
    );
  } catch {
    notFound();
  }
}
