export const i18nConfig = {
  locales: ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi'] as const,
  defaultLocale: 'en' as const,
};

export type Locale = (typeof i18nConfig)['locales'][number];
