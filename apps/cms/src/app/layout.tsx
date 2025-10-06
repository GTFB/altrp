import { IntlProvider } from '@/components/providers/IntlProvider';
import { Providers } from '@/components/providers/Providers';
import './globals.css';
import { getSession } from '@/lib/cookie-session';
import { getMessages } from 'next-intl/server';
import { headers } from 'next/headers';
import { i18nConfig } from '@/config/i18n';

export const metadata = {
  title: {
    default: 'altrp - Git-as-CMS powered site',
    template: '%s | altrp',
  },
  description: 'A modern Git-as-CMS powered website built with Next.js, featuring a blog, internationalization, and beautiful UI components.',
  keywords: ['blog', 'cms', 'nextjs', 'react', 'typescript', 'tailwind'],
  authors: [{ name: 'altrp Team' }],
  creator: 'altrp Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://altrp.example.com',
    siteName: 'altrp',
    title: 'altrp - Git-as-CMS powered site',
    description: 'A modern Git-as-CMS powered website built with Next.js',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'altrp - Git-as-CMS powered site',
    description: 'A modern Git-as-CMS powered website built with Next.js',
    creator: '@altrp',
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const locale = pathname.split('/')[1] || i18nConfig.defaultLocale;
  const currentLocale = i18nConfig.locales.includes(locale) ? locale : i18nConfig.defaultLocale;
  const messages = await getMessages({ locale: currentLocale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <IntlProvider locale={currentLocale} messages={messages}>

        <body className="min-h-screen bg-background antialiased">

          <Providers session={session?.data || {}}>
            {children}
          </Providers>
        </body>
      </IntlProvider>
    </html>
  );
}