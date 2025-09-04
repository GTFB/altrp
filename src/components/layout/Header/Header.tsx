'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { Globe, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-xl">Jambo</span>
            </Link>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Beta
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-sans">Продукт</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <div className="space-y-2">
                      <h4 className="font-heading font-medium">Возможности</h4>
                      <p className="text-sm text-muted-foreground font-sans">
                        Изучите все возможности нашей платформы
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/features" className="block p-2 rounded-md hover:bg-accent">
                        <div className="font-sans font-medium">Аналитика</div>
                        <div className="text-xs text-muted-foreground">Подробная статистика</div>
                      </Link>
                      <Link href="/integrations" className="block p-2 rounded-md hover:bg-accent">
                        <div className="font-sans font-medium">Интеграции</div>
                        <div className="text-xs text-muted-foreground">Подключение сервисов</div>
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 font-sans">
                    Цены
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/docs" legacyBehavior passHref>
                  <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 font-sans">
                    Документация
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Globe className="w-4 h-4 mr-2" />
              RU
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              Войти
            </Button>
            <Button size="sm" className="hidden sm:flex">
              Начать
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
                  <Link href="/features" className="font-sans">Возможности</Link>
                  <Link href="/pricing" className="font-sans">Цены</Link>
                  <Link href="/docs" className="font-sans">Документация</Link>
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full mb-2">
                      Войти
                    </Button>
                    <Button className="w-full">
                      Начать
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
