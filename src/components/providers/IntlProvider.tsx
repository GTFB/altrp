'use client';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

interface IntlProviderProps {
  children: React.ReactNode;
  locale: string;
}

export async function IntlProvider({
  children,
  locale,
}: IntlProviderProps) {
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
