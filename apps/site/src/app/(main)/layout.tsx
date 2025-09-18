
import  Link  from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';
import { LanguageSwitcher } from '@/components/shared/language-switcher';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useLocale } from 'next-intl';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  
  return (
    <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 " >
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <Link href={`/${locale}`} className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded bg-primary"></div>
                  <span className="text-xl font-bold">Jambo</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link 
                  href={`/${locale}`} 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Home
                </Link>
                <Link 
                  href={`/${locale}/blog`} 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Blog
                </Link>
                <Link 
                  href={`/${locale}/about`} 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  About
                </Link>
                <Link 
                  href={`/${locale}/contact`} 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </nav>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                {/* Language Switcher */}
                <LanguageSwitcher variant="compact" size="sm" showText={false} />
                
                {/* Theme Toggle */}
                <ThemeToggle variant="minimal" size="sm" />
                
                {/* Search */}
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
                
                <Separator orientation="vertical" className="h-4" />
                
                {/* Admin link */}
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/dashboard" target="_blank" rel="noopener noreferrer">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>
            {children}
    </div>
  );
}