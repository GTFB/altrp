'use client';

import { NextIntlClientProvider } from 'next-intl';
import { i18nConfig } from '@/config/i18n';

interface IntlProviderProps {
  children: React.ReactNode;
  locale: string;
  messages?: any;
  timeZone?: string;
}

export function IntlProvider({
  children,
  locale,
  messages = '',
  timeZone = 'UTC', 
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider 
    timeZone={timeZone}
    messages={messages} 
    locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
