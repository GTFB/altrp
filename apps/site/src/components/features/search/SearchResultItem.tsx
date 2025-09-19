'use client';

import Link from 'next/link';
import { FileText, User, FolderOpen, File } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { PostTags } from '@/components/features/blog/PostTags/PostTags';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  type: 'post' | 'category' | 'author' | 'page';
  url: string;
  excerpt?: string;
  tags?: string[];
  score?: number;
}

interface SearchResultItemProps {
  result: SearchResult;
  onClick?: (result: SearchResult) => void;
}

export function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const tBlog = useTranslations('blog');
  const tCategories = useTranslations('categories');
  const tNavigation = useTranslations('navigation');
  const tComponents = useTranslations('components');

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'author':
        return <User className="h-4 w-4" />;
      case 'category':
        return <FolderOpen className="h-4 w-4" />;
      case 'page':
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return tBlog('blog');
      case 'author':
        return tBlog('author');
      case 'category':
        return tCategories('title');
      case 'page':
        return tNavigation('page');
      default:
        return type;
    }
  };

  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  return (
    <div className="w-full border-b last:border-b-0">
      <Link
        href={(localePath + result.url) as any}
        onClick={() => onClick?.(result)}
        className="block w-full text-left p-4 hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-start gap-3">
          <span className="flex-shrink-0 mt-1 text-muted-foreground">
            {getResultIcon(result.type)}
          </span>
          <span className="flex-1 min-w-0">
            <span className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">
                {result.title}
              </span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {getResultTypeLabel(result.type)}
              </span>
            </span>
            {result.description && (
              <span className="text-sm text-muted-foreground line-clamp-2 mb-1 block">
                {result.description}
              </span>
            )}
            {result.excerpt && result.type === 'post' && (
              <span className="text-xs text-muted-foreground line-clamp-1 block">
                {result.excerpt}
              </span>
            )}
          </span>
        </span>
      </Link>
      {/* {result.tags && result.tags.length > 0 && (
        <div className="px-4 pb-4">
          <PostTags 
            tags={result.tags.slice(0, 3)} 
            className="mt-2"
          />
          {result.tags.length > 3 && (
            <span className="text-xs text-muted-foreground mt-1 block">
              +{result.tags.length - 3} {tComponents('more')}
            </span>
          )}
        </div>
      )} */}
    </div>
  );
}
