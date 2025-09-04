import { SeoDefault } from '@/components/SeoDefault/SeoDefault';
import { Providers } from '@/components/providers/Providers';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';

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
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <Sidebar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
