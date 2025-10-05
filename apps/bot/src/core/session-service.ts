import { D1StorageService } from '../worker/d1-storage-service';

export interface SessionData {
  [key: string]: any;
}

export interface SessionServiceConfig {
  d1Storage: D1StorageService;
}

/**
 * Сервис для управления сессиями пользователей
 * Использует D1 Database для постоянного хранения состояний
 */
export class SessionService {
  private d1Storage: D1StorageService;

  constructor(config: SessionServiceConfig) {
    this.d1Storage = config.d1Storage;
  }

  /**
   * Создает ключ сессии для пользователя
   */
  private createSessionKey(userId: number, sessionType: string = 'default'): string {
    return `user:${userId}:${sessionType}`;
  }

  /**
   * Устанавливает данные сессии для пользователя
   */
  async setUserSession(userId: number, data: SessionData, sessionType: string = 'default'): Promise<void> {
    try {
      const sessionKey = this.createSessionKey(userId, sessionType);
      await this.d1Storage.setSession(sessionKey, data);
      console.log(`✅ Session set for user ${userId}, type: ${sessionType}`);
    } catch (error) {
      console.error(`❌ Error setting session for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Получает данные сессии пользователя
   */
  async getUserSession(userId: number, sessionType: string = 'default'): Promise<SessionData | null> {
    try {
      const sessionKey = this.createSessionKey(userId, sessionType);
      const sessionData = await this.d1Storage.getSession(sessionKey);
      console.log(`📖 Session retrieved for user ${userId}, type: ${sessionType}:`, sessionData);
      return sessionData;
    } catch (error) {
      console.error(`❌ Error getting session for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Удаляет сессию пользователя
   */
  async deleteUserSession(userId: number, sessionType: string = 'default'): Promise<void> {
    try {
      const sessionKey = this.createSessionKey(userId, sessionType);
      await this.d1Storage.deleteSession(sessionKey);
      console.log(`🗑️ Session deleted for user ${userId}, type: ${sessionType}`);
    } catch (error) {
      console.error(`❌ Error deleting session for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Обновляет часть данных сессии (мерж с существующими)
   */
  async updateUserSession(userId: number, updates: Partial<SessionData>, sessionType: string = 'default'): Promise<void> {
    try {
      const existingData = await this.getUserSession(userId, sessionType) || {};
      const mergedData = { ...existingData, ...updates };
      await this.setUserSession(userId, mergedData, sessionType);
      console.log(`🔄 Session updated for user ${userId}, type: ${sessionType}`);
    } catch (error) {
      console.error(`❌ Error updating session for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Проверяет, существует ли сессия пользователя
   */
  async hasUserSession(userId: number, sessionType: string = 'default'): Promise<boolean> {
    try {
      const sessionData = await this.getUserSession(userId, sessionType);
      return sessionData !== null;
    } catch (error) {
      console.error(`❌ Error checking session for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Устанавливает флаг состояния для пользователя
   */
  async setUserState(userId: number, state: string, value: any = true): Promise<void> {
    await this.updateUserSession(userId, { [state]: value });
  }

  /**
   * Получает флаг состояния пользователя
   */
  async getUserState(userId: number, state: string): Promise<any> {
    const sessionData = await this.getUserSession(userId);
    return sessionData?.[state] || null;
  }

  /**
   * Очищает флаг состояния пользователя
   */
  async clearUserState(userId: number, state: string): Promise<void> {
    const sessionData = await this.getUserSession(userId);
    if (sessionData && sessionData[state] !== undefined) {
      delete sessionData[state];
      await this.setUserSession(userId, sessionData);
    }
  }

  /**
   * Очищает все сессии пользователя
   */
  async clearAllUserSessions(userId: number): Promise<void> {
    try {
      // Можно расширить для очистки разных типов сессий
      await this.deleteUserSession(userId, 'default');
      await this.deleteUserSession(userId, 'flow');
      await this.deleteUserSession(userId, 'temp');
      console.log(`🧹 All sessions cleared for user ${userId}`);
    } catch (error) {
      console.error(`❌ Error clearing all sessions for user ${userId}:`, error);
      throw error;
    }
  }
}
