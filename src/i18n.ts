import { getRequestConfig } from 'next-intl/server';
import { i18nConfig } from '@/config/i18n';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!i18nConfig.locales.includes(locale as any)) locale = i18nConfig.defaultLocale;

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
