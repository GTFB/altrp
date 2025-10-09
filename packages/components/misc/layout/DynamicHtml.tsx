"use client";

import { useLocale } from "@/hooks/use-locale";

interface DynamicHtmlProps {
  children: React.ReactNode;
}

export function DynamicHtml({ children }: DynamicHtmlProps) {
  const { locale } = useLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      {children}
    </html>
  );
}
