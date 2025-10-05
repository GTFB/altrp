import { translations } from '../generated-content';

export class I18nService {
  private defaultLocale: string;

  constructor(defaultLocale = 'ru') {
    this.defaultLocale = defaultLocale;
  }

  /**
   * Загружает сообщение из сгенерированного файла переводов
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
   * Получает язык пользователя (передается извне)
   * @deprecated Используйте UserContextManager.getUserLanguage() вместо этого
   */
  async getUserLanguage(telegramId: number): Promise<string> {
    // I18nService не должен обращаться к БД напрямую
    // Язык должен передаваться извне через getMessage(messageKey, userLanguage)
    console.warn('I18nService.getUserLanguage() is deprecated. Pass userLanguage directly to getMessage()');
    return this.defaultLocale;
  }

  /**
   * Получает сообщение для указанного языка
   */
  async getMessage(messageKey: string, userLanguage?: string): Promise<string> {
    const locale = userLanguage || this.defaultLocale;

    // Пытаемся загрузить сообщение для указанного языка
    let message = await this.loadMessage(locale, messageKey);
    
    // Fallback на язык по умолчанию
    if (!message && locale !== this.defaultLocale) {
      message = await this.loadMessage(this.defaultLocale, messageKey);
    }
    
    // Fallback на ключ сообщения
    return message || messageKey;
  }

  /**
   * @deprecated I18nService не должен сохранять язык в БД
   * Используйте UserContextManager или другой сервис для сохранения языка
   */
  async setUserLanguage(telegramId: number, language: string): Promise<void> {
    console.warn('I18nService.setUserLanguage() is deprecated. Use UserContextManager or another service to save user language.');
  }

  /**
   * Получает список поддерживаемых языков
   */
  getSupportedLanguages(): string[] {
    return ['ru', 'sr'];
  }

  /**
   * Проверяет, поддерживается ли язык
   */
  isLanguageSupported(language: string): boolean {
    return this.getSupportedLanguages().includes(language);
  }
}
