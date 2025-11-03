import { translations } from '../generated-content';

export class I18nService {
  private defaultLocale: string;

  constructor(defaultLocale = 'ru') {
    this.defaultLocale = defaultLocale;
  }

  /**
   * Loads message from generated translations file
   */
  private async loadMessage(locale: string, messageKey: string): Promise<string | null> {
    try {
      return translations[locale]?.[messageKey] || null;
    } catch (error) {
      console.error(`Failed to load message ${messageKey} for locale ${locale}:`, error);
      return null;
    }
  }

  /**
   * Gets user language (passed from outside)
   * @deprecated Use UserContextManager.getUserLanguage() instead
   */
  async getUserLanguage(telegramId: number): Promise<string> {
    // I18nService should not access DB directly
    // Language should be passed from outside through getMessage(messageKey, userLanguage)
    console.warn('I18nService.getUserLanguage() is deprecated. Pass userLanguage directly to getMessage()');
    return this.defaultLocale;
  }

  /**
   * Gets message for specified language
   */
  async getMessage(messageKey: string, userLanguage?: string): Promise<string> {
    const locale = userLanguage || this.defaultLocale;

    // Try to load message for specified language
    let message = await this.loadMessage(locale, messageKey);
    
    // Fallback to default language
    if (!message && locale !== this.defaultLocale) {
      message = await this.loadMessage(this.defaultLocale, messageKey);
    }
    
    // Fallback to message key
    return message || messageKey;
  }

  /**
   * @deprecated I18nService should not save language to DB
   * Use UserContextManager or another service to save user language
   */
  async setUserLanguage(telegramId: number, language: string): Promise<void> {
    console.warn('I18nService.setUserLanguage() is deprecated. Use UserContextManager or another service to save user language.');
  }

  /**
   * Gets list of supported languages
   */
  getSupportedLanguages(): string[] {
    return ['ru', 'sr'];
  }

  /**
   * Checks if language is supported
   */
  isLanguageSupported(language: string): boolean {
    return this.getSupportedLanguages().includes(language);
  }
}
