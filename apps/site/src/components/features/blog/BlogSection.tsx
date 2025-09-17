'use client';

import { useBlogPostsSimple } from '@/hooks/use-blog-posts-simple';
import { PostCard } from '@/components/features/blog/PostCard/PostCard';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/hooks/use-locale';

interface BlogSectionProps {
  limit?: number;
  showViewAll?: boolean;
  title?: string;
  description?: string;
  category?: string;
  author?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'date' | 'title' | 'created';
  sortOrder?: 'asc' | 'desc';
}

export function BlogSection({ 
  limit = 6, 
  showViewAll = true,
  title = "Latest Posts",
  description = "Read our latest articles and updates",
  category,
  author,
  tags,
  search,
  sortBy = 'date',
  sortOrder = 'desc'
}: BlogSectionProps) {
  const {locale} = useLocale();
  
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
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
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
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>
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
          <h2 className="text-3xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground mb-6">{description}</p>
          <p className="text-muted-foreground">No posts found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>

      {showViewAll && (
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href={`/${locale}/blog`}>
              View All Posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
