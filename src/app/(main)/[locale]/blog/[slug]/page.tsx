import { PostRepository } from '@/repositories/post.repository';
import { RenderMdx } from '@/lib/mdx';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: { slug: string };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const postRepo = new PostRepository();
  const post = await postRepo.findBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        {post.date && (
          <time className="text-muted-foreground">
            {new Date(post.date).toLocaleDateString()}
          </time>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-muted rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>
      
      <div className="prose prose-lg max-w-none">
        {post.content && <RenderMdx source={{ compiledSource: post.content }} />}
      </div>
    </article>
  );
}
