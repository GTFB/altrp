import { D1StorageService } from '../worker/d1-storage-service';

export interface UserContext {
  userId: number;
  telegramId: number;
  currentFlow: string;
  currentStep: number;
  data: Record<string, any>; // Здесь храним все переменные пользователя
  stepHistory: Array<{flow: string, step: number, timestamp: string}>;
  
  // Новые поля для управления пересылкой
  messageForwardingEnabled: boolean; // Включена ли пересылка в топик
  flowMode: boolean; // Находится ли пользователь в режиме флоу
}

export class UserContextManager {
  private d1Storage: D1StorageService | null = null;
  
  setD1Storage(d1Storage: D1StorageService): void {
    this.d1Storage = d1Storage;
  }

  async getContext(telegramId: number): Promise<UserContext | null> {
    if (!this.d1Storage) {
      console.error('❌ D1Storage not initialized');
      return null;
    }
    
    try {
      const user = await this.d1Storage.getUser(telegramId);
      if (!user || !user.id) {
        console.log(`⚠️ User ${telegramId} not found in database`);
        return null;
      }
      
      const savedData = user.data ? JSON.parse(user.data) : {};
      
      const context: UserContext = {
        userId: user.id,
        telegramId,
        currentFlow: savedData.currentFlow || '',
        currentStep: savedData.currentStep || 0,
        data: savedData.data || {},
        stepHistory: savedData.stepHistory || [],
        messageForwardingEnabled: savedData.messageForwardingEnabled ?? true,
        flowMode: savedData.flowMode ?? false
      };
      
      console.log(`📚 Context loaded from DB for user ${telegramId}:`, {
        currentFlow: context.currentFlow,
        currentStep: context.currentStep,
        flowMode: context.flowMode
      });
      
      return context;
    } catch (error) {
      console.error(`❌ Error loading context for user ${telegramId}:`, error);
      return null;
    }
  }
  
  async createContext(telegramId: number, userId: number): Promise<UserContext> {
    console.log(`🔄 Creating new context for user ${telegramId} (DB ID: ${userId})`);
    const context: UserContext = {
      userId,
      telegramId,
      currentFlow: '',
      currentStep: 0,
      data: {},
      stepHistory: [],
      messageForwardingEnabled: true, // По умолчанию включено
      flowMode: false // По умолчанию не в флоу
    };
    
    // Сразу сохраняем в БД
    await this.saveContextToDatabase(context);
    console.log(`✅ Context created and saved to DB for user ${telegramId}`);
    return context;
  }
  
  async updateContext(telegramId: number, updates: Partial<UserContext>): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      Object.assign(context, updates);
      console.log(`🔄 Context updated for user ${telegramId}:`, updates);
      
      // Сохраняем обновленный контекст в БД
      await this.saveContextToDatabase(context);
    } else {
      console.warn(`⚠️ Context not found for user ${telegramId}`);
    }
  }
  
  async setVariable(telegramId: number, path: string, value: any): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      this.setNestedProperty(context.data, path, value);
      console.log(`📝 Variable set for user ${telegramId}: ${path} = ${JSON.stringify(value)}`);
      // Сохраняем обновленный контекст в БД
      await this.saveContextToDatabase(context);
    } else {
      console.warn(`⚠️ Context not found for user ${telegramId} when setting variable ${path}`);
    }
  }
  
  async getVariable(telegramId: number, path: string): Promise<any> {
    const context = await this.getContext(telegramId);
    if (context) {
      const value = this.getNestedProperty(context.data, path);
      console.log(`📖 Variable read for user ${telegramId}: ${path} = ${JSON.stringify(value)}`);
      return value;
    }
    return undefined;
  }

  // Методы для управления пересылкой сообщений
  async enableMessageForwarding(telegramId: number): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      context.messageForwardingEnabled = true;
      console.log(`📤 Message forwarding ENABLED for user ${telegramId}`);
      await this.saveContextToDatabase(context);
    }
  }

  async disableMessageForwarding(telegramId: number): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      context.messageForwardingEnabled = false;
      console.log(`📥 Message forwarding DISABLED for user ${telegramId}`);
      await this.saveContextToDatabase(context);
    }
  }

  async isMessageForwardingEnabled(telegramId: number): Promise<boolean> {
    const context = await this.getContext(telegramId);
    const enabled = context?.messageForwardingEnabled ?? true;
    console.log(`📋 Message forwarding for user ${telegramId}: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    return enabled;
  }

  // Методы для управления режимом флоу
  async enterFlowMode(telegramId: number): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      context.flowMode = true;
      context.messageForwardingEnabled = false; // Автоматически отключаем пересылку
      console.log(`🎯 User ${telegramId} ENTERED flow mode (forwarding auto-disabled)`);
      await this.saveContextToDatabase(context);
    }
  }

  async exitFlowMode(telegramId: number): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      context.flowMode = false;
      context.messageForwardingEnabled = true; // Автоматически включаем пересылку обратно
      console.log(`🏁 User ${telegramId} EXITED flow mode (forwarding auto-enabled)`);
      await this.saveContextToDatabase(context);
    }
  }

  async isInFlowMode(telegramId: number): Promise<boolean> {
    const context = await this.getContext(telegramId);
    const inFlow = context?.flowMode ?? false;
    console.log(`🎯 Flow mode status for user ${telegramId}: ${inFlow ? 'IN FLOW' : 'NOT IN FLOW'}`);
    return inFlow;
  }
  
  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Сохраняем контекст в БД
  private async saveContextToDatabase(context: UserContext): Promise<void> {
    if (!this.d1Storage) {
      console.error('❌ D1Storage not initialized for saving context');
      return;
    }
    
    const contextData = {
      currentFlow: context.currentFlow,
      currentStep: context.currentStep,
      data: context.data,
      stepHistory: context.stepHistory,
      messageForwardingEnabled: context.messageForwardingEnabled,
      flowMode: context.flowMode
    };
    
    console.log(`💾 Saving context to database for user ${context.telegramId}`);
    await this.d1Storage.updateUserData(context.telegramId, JSON.stringify(contextData));
    console.log(`✅ Context saved to database for user ${context.telegramId}`);
  }

  // Получить или создать контекст
  async getOrCreateContext(telegramId: number, userId: number): Promise<UserContext> {
    let context = await this.getContext(telegramId);
    if (!context) {
      // Создаем новый контекст
      context = await this.createContext(telegramId, userId);
    }
    return context;
  }

  // Получить язык пользователя из базы данных
  async getUserLanguage(telegramId: number): Promise<string> {
    if (!this.d1Storage) {
      console.warn('D1Storage not set, using default locale');
      return 'ru';
    }

    try {
      const user = await this.d1Storage.getUser(telegramId);
      const userLanguage = user?.language;
      
      // Проверяем, что язык поддерживается
      if (userLanguage && ['ru', 'sr'].includes(userLanguage)) {
        return userLanguage;
      }
      
      return 'ru'; // Default fallback
    } catch (error) {
      console.error(`Error getting user language for ${telegramId}:`, error);
      return 'ru';
    }
  }
}