'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { Globe, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLocale } from 'next-intl';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

export function Header() {
  const locale = useLocale();
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">Jambo</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              t('beta')
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-sans">t('product')</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <div className="space-y-2">
                      <h4 className="font-heading font-medium">t('features')</h4>
                      <p className="text-sm text-muted-foreground font-sans">
                        t('features_description')
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/${locale}/features`} className="block p-2 rounded-md hover:bg-accent">
                        <div className="font-sans font-medium">t('analytics')</div>
                        <div className="text-xs text-muted-foreground">t('analytics_description')</div>
                      </Link>
                      <Link href={`/${locale}/integrations`} className="block p-2 rounded-md hover:bg-accent">
                        <div className="font-sans font-medium">t('integrations')</div>
                        <div className="text-xs text-muted-foreground">t('integrations_description')</div>
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href={`/${locale}/pricing`} legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 font-sans">
                    t('pricing')
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href={`/${locale}/docs`} legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 font-sans">
                    t('docs')
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <LanguageSwitcher />
            <Button variant="outline" size="sm" className="hidden sm:flex">
                t('login')
            </Button>
            <Button size="sm" className="hidden sm:flex">
              t('start')
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link href={`/${locale}/features`} className="font-sans">t('features')</Link>
                  <Link href={`/${locale}/pricing`} className="font-sans">t('pricing')</Link>
                  <Link href={`/${locale}/docs`} className="font-sans">t('docs')</Link>
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full mb-2">
                      t('login')
                    </Button>
                    <Button className="w-full">
                      t('start')
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
