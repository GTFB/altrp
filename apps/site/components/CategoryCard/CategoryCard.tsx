'use client';

import { type Category } from '@/repositories/category.repository';
import Link from 'next/link';
import { useLocale } from '@/hooks/use-locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const locale = useLocale();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">
          <Link href={`/${locale}/categories/${category.slug}`} className="hover:text-primary">
            {category.title}
          </Link>
        </CardTitle>
        {category.excerpt && (
          <CardDescription className="line-clamp-3">
            {category.excerpt}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {category.tags && category.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <Link 
          href={`/${locale}/categories/${category.slug}`}
          className="text-sm text-muted-foreground hover:text-primary flex items-center"
        >
          <Tag className="h-4 w-4 mr-1" />
          View posts in this category
        </Link>
      </CardContent>
    </Card>
  );
}
