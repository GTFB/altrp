import { DynamicHtml } from '@/components/DynamicHtml';
import { Providers } from '@/components/providers/Providers';
import './globals.css'; 

export const metadata = {
  title: {
    default: 'Jambo - Git-as-CMS powered site',
    template: '%s | Jambo',
  },
  description: 'A modern Git-as-CMS powered website built with Next.js, featuring a blog, internationalization, and beautiful UI components.',
  keywords: ['blog', 'cms', 'nextjs', 'react', 'typescript', 'tailwind'],
  authors: [{ name: 'Jambo Team' }],
  creator: 'Jambo Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://jambo.example.com',
    siteName: 'Jambo',
    title: 'Jambo - Git-as-CMS powered site',
    description: 'A modern Git-as-CMS powered website built with Next.js',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jambo - Git-as-CMS powered site',
    description: 'A modern Git-as-CMS powered website built with Next.js',
    creator: '@jambo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DynamicHtml>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
            {children}
        </Providers>
      </body>
    </DynamicHtml>
  );
}