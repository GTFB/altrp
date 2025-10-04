
import { NextIntlClientProvider } from "next-intl";

interface IntlProviderProps {
  children: React.ReactNode;
  locale: string;
  messages?: any;
  timeZone?: string;
}

export function IntlProvider({
  children,
  locale,
  messages = "",
  timeZone = "UTC",
}: IntlProviderProps) {
  return (
    <NextIntlClientProvider
      timeZone={timeZone}
      messages={messages}
      locale={locale}
    >
      {children}
    </NextIntlClientProvider>
  );
}
