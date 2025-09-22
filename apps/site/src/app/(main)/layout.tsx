'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {  Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useLocale, useTranslations } from 'next-intl';
import { DynamicBreadcrumbs } from '@/components/shared/dynamic-breadcrumbs';
import { PopupSearch } from '@/components/features/search/PopupSearch';
import { Container } from '@/components/layout/Container';
export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '/';
  const t = useTranslations('navigation');
  return (
    <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 " >
          <Container >
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <Link href={`${localePath}`} className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded bg-primary"></div>
                  <span className="text-xl font-bold">Jambo</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link 
                  href={`${localePath}`} 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t('home')}
                </Link>
                <Link 
                  href={`${localePath}/blog`} 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t('blog')}
                </Link>
                <Link 
                  href={`${localePath}/about`} 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t('about')}
                </Link>
                <Link 
                  href={`${localePath}/contact`} 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  {t('contact')}
                </Link>
              </nav>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <LanguageSwitcher variant="compact" size="sm" showText={false} />
                
                {/* Theme Toggle */}
                <ThemeToggle variant="minimal" size="sm" />
                
                {/* Search */}
                <PopupSearch />
                <Separator orientation="vertical" className="h-4" />
                
                {/* Admin link */}
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/dashboard" target="_blank" rel="noopener noreferrer">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('admin')}
                  </Link>
                </Button>
              </div>
            </div>
          </Container>
        </header>
        
        {/* Main Content */}
        <main className="flex-1">
          {/* Dynamic Breadcrumbs */}
          <DynamicBreadcrumbs />
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t bg-background">
          <Container className="py-8 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded bg-primary"></div>
                  <span className="text-xl font-bold">Jambo</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('discover_amazing_content_organized_by_tags_and_categories')}
                </p>
              </div>
              
              {/* Navigation */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">{t('navigation')}</h3>
                <nav className="flex flex-col space-y-2">
                  <Link 
                    href={`${localePath}`} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('home')}
                  </Link>
                  <Link 
                    href={`${localePath}/blog`} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('blog')}
                  </Link>
                  <Link 
                    href={`${localePath}/about`} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('about')}
                  </Link>
                  <Link 
                    href={`${localePath}/contact`} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('contact')}
                  </Link>
                </nav>
              </div>
              
              {/* Categories */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">{t('categories')}</h3>
                <nav className="flex flex-col space-y-2">
                  <Link 
                    href={`${localePath}/categories`} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    All Categories
                  </Link>
                  <Link 
                    href={`${localePath}/tags`} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('tags')}
                  </Link>
                </nav>
              </div>
              
              {/* Social & Admin */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Tools</h3>
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/admin/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t('admin')}
                  </Link>
                  <div className="flex items-center space-x-4">
                    <LanguageSwitcher variant="compact" size="sm" showText={false} />
                    <ThemeToggle variant="minimal" size="sm" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Bar */}
            <Separator className="my-6" />
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Jambo. {t('all_rights_reserved')}
              </p>
              <div className="flex items-center space-x-6">
                <Link 
                  href={`${localePath}/privacy`} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('privacy_policy')}
                </Link>
                <Link 
                  href={`${localePath}/terms`} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('terms_of_service')}
                </Link>
              </div>
            </div>
          </Container>
        </footer>
    </div>
  );
}