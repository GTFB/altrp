import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © 2024 {siteConfig.name}. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </a>
            <a
              href="/api/rss"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              RSS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
