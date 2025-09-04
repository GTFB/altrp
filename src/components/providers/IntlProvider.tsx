import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { i18nConfig } from '@/config/i18n';

export async function IntlProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const messages = await getMessages(locale);
  
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
