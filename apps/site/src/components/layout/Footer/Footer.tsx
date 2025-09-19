import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Globe, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useLocale } from 'next-intl';

export function Footer() {
  
  const locale = useLocale() !== 'en' ? useLocale() : '';
  const localePath = locale !== '' ? `/${locale}` : '';
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">Jambo</span>
            </div>
            <p className="text-sm text-muted-foreground font-sans max-w-xs">
              Современная платформа для создания и управления контентом с использованием Git-as-CMS архитектуры.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold">t('product')</h3>
            <div className="space-y-2">
              <Link href={`${localePath}/features`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('features')
              </Link>
                  <Link href={`${localePath}/pricing`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('pricing')
              </Link>
              <Link href={`${localePath}/integrations`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('integrations')
              </Link>
              <Link href={`${localePath}/changelog`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('changelog')
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold">t('resources')</h3>
            <div className="space-y-2">
              <Link href={`${localePath}/docs`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('docs')
              </Link>
              <Link href={`${localePath}/tutorials`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('tutorials')
              </Link>
              <Link href={`${localePath}/api`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('api')
              </Link>
              <Link href={`${localePath}/status`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('status')
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
              <h3 className="font-heading font-semibold">t('company')</h3>
            <div className="space-y-2">
              <Link href={`${localePath}/about`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('about')
              </Link>
              <Link href={`${localePath}/blog`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('blog')
              </Link>
              <Link href={`${localePath}/careers`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('careers')
              </Link>
              <Link href={`${localePath}/contact`} className="block text-sm text-muted-foreground hover:text-foreground font-sans">
                t('contact')
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground font-sans">
            <span>© 2024 Jambo. t('all rights reserved')</span>
            <Badge variant="outline" className="text-xs">
              Beta v1.0.0
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground font-sans">
            <Link href={`${localePath}/privacy`} className="hover:text-foreground">
              t('privacy')
            </Link>
            <Link href={`${localePath}/terms`} className="hover:text-foreground">
              t('terms')
            </Link>
            <Link href={`${localePath}/cookies`}
             className="hover:text-foreground">
                t('cookies')
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
