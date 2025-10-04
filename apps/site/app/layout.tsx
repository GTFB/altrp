import type { Metadata } from "next";
import { Geist, Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { PROJECT_SETTINGS } from "@/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
  fallback: ['system-ui', 'arial'],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
  fallback: ['serif'],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  preload: false, // Не preload, так как используется реже
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://finurcons.ru'),
  title: "Финюр Консалтинг - Бухгалтерские и юридические услуги",
  description: "Профессиональные бухгалтерские и юридические услуги в Краснодаре. Налоговое планирование, ведение учета, юридическое сопровождение бизнеса.",
  keywords: [
    "бухгалтерские услуги",
    "юридические услуги", 
    "налоговое планирование",
    "ведение учета",
    "Краснодар",
    "ООО",
    "ИП",
    "консалтинг",
    "аудит",
    "договоры"
  ],
  openGraph: {
    type: "website",
    siteName: "Финюр Консалтинг",
    locale: "ru_RU",
    url: "https://finurcons.ru",
    title: "Финюр Консалтинг - Ваши налоги и договоры под защитой",
    description: "Крупнейший центр в Краснодарском крае, где бухгалтера, юристы и специалисты по тендерам работают как одна команда.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Финюр Консалтинг - Бухгалтерские и юридические услуги",
      },
    ],
  },
  authors: [
    {
      name: "Финюр Консалтинг",
      url: "https://finurcons.ru",
    },
  ],
  creator: "Финюр Консалтинг",
  icons: [
    {
      rel: "icon",
      url: "/images/favicon.jpg",
    },
  ],
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/images/tanya.png" as="image" type="image/png" />
        <link rel="preload" href="/images/element.svg" as="image" type="image/svg+xml" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS to prevent style crash */
            body { 
              visibility: hidden; 
              opacity: 0; 
              contain: layout style;
            }
            body.styles-loaded { 
              visibility: visible; 
              opacity: 1; 
              contain: none;
              transition: opacity 0.3s ease-in-out;
            }
            /* Prevent any style changes during loading */
            body:not(.styles-loaded) * {
              opacity: 1 !important;
              transition: none !important;
              animation: none !important;
            }
          `
        }} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#82181A" />
        <meta name="color-scheme" content="light dark" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${geistSans.variable} ${playfairDisplay.variable} ${roboto.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme={PROJECT_SETTINGS.defaultTheme} enableSystem={false}>
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
