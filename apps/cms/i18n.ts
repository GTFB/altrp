import { getRequestConfig } from 'next-intl/server';
import { i18nConfig } from '@/config/i18n';
const locales = i18nConfig.locales;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) locale = i18nConfig.defaultLocale;

  return {
    messages: (await import(`@/packages/content/locales/${locale}.json`)).default,
    timeZone: 'UTC'
    };
});
