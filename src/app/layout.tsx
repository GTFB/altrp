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
        {children}
      </body>
    </html>
  );
}
