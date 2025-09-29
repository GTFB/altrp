'use client';

import { type Post } from '@/repositories/post.repository';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { PostTags } from '@/components/features/blog/PostTags';
import { PostMeta } from '@/components/features/blog/PostMeta';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';

  return (
    <article className="border rounded-lg p-6 hover:shadow-md transition-shadow">
      <header className="mb-4">
        <h2 className="text-xl font-semibold mb-2">
          <Link href={`${localePath}/blog/${post.slug}`} className="hover:text-primary">
            {post.title}
          </Link>
        </h2>
        <PostMeta 
          date={post.date}
          author={post.author}
          category={post.category}
          className="mb-2"
        />
      </header>
      
      {post.excerpt && (
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {post.excerpt}
        </p>
      )}
      
      <PostTags tags={post.tags || []} />
    </article>
  );
}
