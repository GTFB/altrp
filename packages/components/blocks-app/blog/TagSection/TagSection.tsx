'use client';

import { useBlogPostsSimple } from '@/hooks/use-blog-posts-simple';
import { PostCard } from '@/components/blocks-app/blog/PostCard/PostCard';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Hash } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useTranslations } from 'next-intl';

interface TagSectionProps {
  tags: string[];
  limit?: number;
  showViewAll?: boolean;
  title?: string;
  description?: string;
  category?: string;
  author?: string;
  search?: string;
  sortBy?: 'date' | 'title' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export function TagSection({ 
  tags,
  limit = 6, 
  showViewAll = true,
  title,
  description,
  category,
  author,
  search,
  sortBy = 'date',
  sortOrder = 'desc'
}: TagSectionProps) {
    const locale = useLocale() === 'en' ? '' : useLocale();
  const localePath = locale !== '' ? `/${locale}` : '';
  const t = useTranslations('blog');
  // Generate title and description if not provided
  const tagsText = tags.join(', ');
  const sectionTitle = title || `Posts with tags: ${tagsText}`;
  const sectionDescription = description || `Read articles with tags: ${tagsText}`;
  
  const { 
    posts, 
    loading, 
    error, 
    refetch 
  } = useBlogPostsSimple({
    limit,
    category,
    author,
    tags,
    search,
    sortBy,
    sortOrder
  });

  if (error) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Hash className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{sectionTitle}</h2>
          </div>
          <p className="text-destructive mb-4">Error loading posts: {error}</p>
          <Button onClick={refetch} variant="outline">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Hash className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{sectionTitle}</h2>
          </div>
          <p className="text-muted-foreground mb-6">{sectionDescription}</p>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Hash className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{sectionTitle}</h2>
          </div>
          <p className="text-muted-foreground mb-6">{sectionDescription}</p>
          <p className="text-muted-foreground">No posts found with these tags</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Hash className="h-8 w-8 text-muted-foreground mr-2" />
          <h2 className="text-3xl font-bold">{sectionTitle}</h2>
        </div>
        <p className="text-muted-foreground mb-6">{sectionDescription}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {showViewAll && (
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href={`${localePath}/tags`}>
              {t('viewAllPostsWithTags')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
