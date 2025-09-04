'use client';

import { NextIntlClientProvider } from 'next-intl';

interface IntlProviderProps {
  children: React.ReactNode;
  locale: string;
  messages: any;
}

export function IntlProvider({
  children,
  locale,
  messages,
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
