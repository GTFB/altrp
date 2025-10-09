import { getRequestConfig } from 'next-intl/server';
import { i18nConfig } from '@/config/i18n';
import { headers } from 'next/headers';

const locales = i18nConfig.locales;

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) locale = i18nConfig.defaultLocale;

  // Handle headers asynchronously for Next.js 15+ compatibility
  let timeZone = 'UTC';
  try {
    const headersList = await headers();
    const intlLocale = headersList.get('X-NEXT-INTL-LOCALE');
    if (intlLocale) {
      // Extract timezone from locale if available
      timeZone = intlLocale.includes('_') ? intlLocale.split('_')[1] : 'UTC';
    }
  } catch (error) {
    // Fallback to default timezone if headers access fails
    console.warn('Failed to access headers for timezone detection:', error);
  }

  return {
    messages: (await import(`@/packages/content/locales/${locale}.json`)).default,
    timeZone
  };
});
