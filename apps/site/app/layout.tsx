import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { PROJECT_SETTINGS } from "@/settings";
import { ScriptOptimizer } from "@/components/ui/script-optimizer";
import { AccessibilityEnhancer } from "@/components/ui/accessibility-enhancer";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { PageTransition } from "@/components/ui/page-transition";
import { StyleLoader } from "@/components/ui/style-loader";
import { ToTopButton } from "@/components/home/ui/to-top-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://altrp.org'),
  title: "ALTRP",
  description: "Digital Product Generation Platform",
  keywords: [
    "digital products",
    "product generation",
    "platform development",
    "web applications",
    "mobile apps",
    "software development",
    "digital solutions",
    "productivity tools",
    "automation",
    "technology platform"
  ],
  openGraph: {
    type: "website",
    siteName: "ALTRP",
    locale: "ru_RU",
    url: "https://altrp.org",
    title: "ALTRP - Digital Product Generation Platform",
    description: "Digital Product Generation Platform",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ALTRP",
      },
    ],
  },
  authors: [
    {
      name: "ALTRP",
      url: "https://altrp.org",
    },
  ],
  creator: "ALTRP",
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

      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
        <StyleLoader />
        <ScriptOptimizer />
        <AccessibilityEnhancer />
        <PerformanceMonitor />
        <ThemeProvider attribute="class" defaultTheme={PROJECT_SETTINGS.defaultTheme} enableSystem={false}>
          <PageTransition>
            {children}
          </PageTransition>
        </ThemeProvider>
      </body>
    </html>
  );
}
