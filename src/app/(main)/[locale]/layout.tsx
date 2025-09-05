import { IntlProvider } from '@/components/providers/IntlProvider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Home, Settings, Search } from 'lucide-react';
import Link from 'next/link';

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <IntlProvider locale={params.locale}>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded bg-primary"></div>
                  <span className="text-xl font-bold">Jambo</span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link 
                  href="/" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Home
                </Link>
                <Link 
                  href="/blog" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Blog
                </Link>
                <Link 
                  href="/about" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  About
                </Link>
                <Link 
                  href="/contact" 
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Contact
                </Link>
              </nav>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
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

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </IntlProvider>
  );
}
