'use client';

import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
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

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  const t = useTranslations('navigation');

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
