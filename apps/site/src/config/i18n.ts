import { PROJECT_SETTINGS, SUPPORTED_LANGUAGES } from '@/settings';

export const i18nConfig = {
  locales: SUPPORTED_LANGUAGES,
  defaultLocale: PROJECT_SETTINGS.defaultLanguage,
};

export type Locale = (typeof i18nConfig)['locales'][number];
