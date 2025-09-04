import { PostRepository } from '@/repositories/post.repository';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PostTags } from '@/components/features/blog/PostTags';
import { PostMeta } from '@/components/features/blog/PostMeta';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: { slug: string; locale: string };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const postRepo = new PostRepository();
  const post = await postRepo.findBySlug(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found | Jambo Blog',
      description: 'The requested blog post could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jambo.example.com';
  const postUrl = `${baseUrl}/${params.locale}/blog/${params.slug}`;

  return {
    title: `${post.title} | Jambo Blog`,
    description: post.excerpt || post.description || `Read the article "${post.title}" on our blog`,
    keywords: post.tags?.join(', ') || '',
    authors: [{ name: 'Jambo Team' }],
    openGraph: {
      title: post.title,
      description: post.excerpt || post.description,
      type: 'article',
      url: postUrl,
      locale: params.locale === 'ru' ? 'ru_RU' : 'en_US',
      siteName: 'Jambo Blog',
      publishedTime: post.date,
      authors: ['Jambo Team'],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.description,
    },
    alternates: {
      canonical: postUrl,
    },
  };
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
          <PostMeta 
            date={post.date}
            author={post.author} 
            category={post.category}
            className="mb-4"
          />
          <PostTags tags={post.tags || []} />
        </header>
        
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content || '' }}>
          
        </div>
      </article>
  );
}
