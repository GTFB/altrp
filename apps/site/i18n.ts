import { getRequestConfig } from 'next-intl/server';
import { i18nConfig } from '@/config/i18n';
const locales = ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi']

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) locale = i18nConfig.defaultLocale;

  return {
    messages: (await import(`@/packages/content/locales/${locale}.json`)).default
    };
});
