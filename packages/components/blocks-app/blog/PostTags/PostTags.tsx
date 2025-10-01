'use client';
import { Badge } from '@/components/ui/badge';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PostTagsProps {
  tags: string[];
  className?: string;
}

export function PostTags({ tags, className = '' }: PostTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const pathname = usePathname();
  
  const currentTag = pathname.match(/\/tags\/([^\/]+)/)?.[1];
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => {
        const isActive = currentTag === tag;
        
        return (
          <Badge
            key={tag}
            variant={isActive ? "default" : "secondary"}
            className={`text-xs ${isActive ? 'cursor-default' : 'cursor-pointer'}`}
          >
            {isActive ? (
              tag
            ) : (
              <Link href={`${localePath}/tags/${tag}`}>
                {tag}
              </Link>
            )}
          </Badge>
        );
      })}
    </div>
  );
}
