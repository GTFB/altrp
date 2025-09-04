import { SeoDefault } from '@/components/SeoDefault/SeoDefault';

export const metadata = {
  title: 'Jambo',
  description: 'Git-as-CMS powered site',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background antialiased">
        <SeoDefault />
        <div className="flex flex-col min-h-screen">
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-xl font-bold">Jambo</h1>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t bg-card">
            <div className="container mx-auto px-4 py-8">
              <p className="text-sm text-muted-foreground">
                © 2024 Jambo. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
