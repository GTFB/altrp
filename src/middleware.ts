import createMiddleware from 'next-intl/middleware';
import { i18nConfig } from '@/config/i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales: i18nConfig.locales,

  // Used when no locale matches
  defaultLocale: i18nConfig.defaultLocale,

  // Always show the locale in the URL
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ru|en)/:path*']
};
