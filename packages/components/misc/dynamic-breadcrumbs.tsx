'use client';

import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

interface BreadcrumbSegment {
  label: string;
  href?: string | undefined;
  isLast?: boolean;
}

interface ContentInfo {
  title: string;
  type: 'post' | 'category' | 'author' | 'page';
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const t = useTranslations('navigation');
  const [contentInfo, setContentInfo] = useState<ContentInfo | null>(null);

  // Fetch content info for dynamic segments
  useEffect(() => {
    const fetchContentInfo = async () => {
      const segments = pathname.split('/').filter(Boolean);
      let contentType = '';
      let slug = '';

      // Find content type and slug
      for (let i = 0; i < segments.length; i++) {
        // Skip locale segment
        if (i === 0 && segments[i] === locale) {
          continue;
        }
        
        // Check for known content types
        if (['blog', 'categories', 'authors'].includes(segments[i]) && i + 1 < segments.length) {
          contentType = segments[i];
          slug = segments[i + 1];
          break;
        }
      }

      // Fetch content info based on type
      if (contentType && slug) {
        try {
          let apiType = '';
          switch (contentType) {
            case 'blog':
              apiType = 'post';
              break;
            case 'categories':
              apiType = 'category';
              break;
            case 'authors':
              apiType = 'author';
              break;
          }

          const response = await fetch(`/api/content-info?slug=${encodeURIComponent(slug)}&type=${apiType}`);
          if (response.ok) {
            const data = await response.json();
            setContentInfo({
              title: data.title,
              type: data.type
            });
          }
        } catch (error) {
          console.error('Error fetching content info:', error);
        }
      }
    };

    fetchContentInfo();
  }, [pathname, locale]);

  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [];

    breadcrumbs.push({
      label: t('home'),
      href: localePath || '/'
    });

    let currentPath = localePath;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      if (i === 0 && segment === locale) {
        continue;
      }
      
      currentPath += `/${segment}`;
      
      let label = segment;
      let href: string | undefined = currentPath;
      let isLast = i === segments.length - 1;
      
      switch (segment) {
        case 'blog':
          label = t('blog');
          break;
        case 'about':
          label = t('about');
          break;
        case 'contact':
          label = t('contact');
          break;
        case 'tags':
          label = t('tags');
          break;
        case 'categories':
          label = t('categories');
          break;
        default:
          // Check if this is a content slug and we have content info
          if (contentInfo && isLast) {
            label = contentInfo.title;
          }
          break;
      }
      
      if (isLast) {
        href = undefined;
      }
      
      breadcrumbs.push({
        label,
        href,
        isLast
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Breadcrumb className="container mx-auto px-4 py-4">
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {breadcrumb.isLast ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={breadcrumb.href!}>
                  {breadcrumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!breadcrumb.isLast && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
