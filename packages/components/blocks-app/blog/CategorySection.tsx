'use client';

import { CategoryRepository } from '@/repositories/category.repository';
import { CategoryCard } from '@/components/blocks-app/CategoryCard';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Tag } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

interface CategorySectionProps {
  limit?: number;
  showViewAll?: boolean;
  title?: string;
  description?: string;
}

export function CategorySection({ 
  limit = 6, 
  showViewAll = true,
  title = "Categories",
  description = "Explore our content organized by topics"
}: CategorySectionProps) {
    const locale = useLocale() === 'en' ? '' : useLocale();
  const localePath = locale !== '' ? `/${locale}` : '';
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.categories.slice(0, limit));
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchCategories();
  }, [limit]);

  if (error) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Tag className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-destructive mb-4">Error loading categories: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
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
            <Tag className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground mb-6">{description}</p>
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Tag className="h-8 w-8 text-muted-foreground mr-2" />
            <h2 className="text-3xl font-bold">{title}</h2>
          </div>
          <p className="text-muted-foreground mb-6">{description}</p>
          <p className="text-muted-foreground">No categories found</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Tag className="h-8 w-8 text-muted-foreground mr-2" />
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>
        <p className="text-muted-foreground mb-6">{description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {categories.map((category) => (
          <CategoryCard key={category.slug} category={category} />
        ))}
      </div>

      {showViewAll && (
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href={`${localePath}/categories`}>
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}