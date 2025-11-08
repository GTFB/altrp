import { D1StorageService } from '../worker/d1-storage-service';

export interface UserContext {
  userId: number;
  telegramId: number;
  currentFlow: string;
  currentStep: number;
  data: Record<string, any>; // Here we store all user variables
  stepHistory: Array<{flow: string, step: number, timestamp: string}>;
  
  // New fields for forwarding management
  messageForwardingEnabled: boolean; // Whether forwarding to topic is enabled
  flowMode: boolean; // Whether user is in flow mode
  
  // Fields for topic flow mode (when admin manages flow in topic)
  flowInTopic: boolean; // Whether flow is running in topic mode
  topicId: number | null; // Topic ID where flow is running
  adminChatId: number | null; // Admin chat ID where topic is located
  targetUserId: number | null; // User ID (human) that admin is managing in this flow
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
      const human = await this.d1Storage.getHumanByTelegramId(telegramId);
      if (!human || !human.id) {
        console.log(`⚠️ Human ${telegramId} not found in database`);
        return null;
      }
      
      // Parse data_in JSON to extract context and other data
      let savedData = {};
      if (human.dataIn) {
        try {
          const dataInObj = JSON.parse(human.dataIn);
          // Context data is stored in the context field of dataIn, or directly in dataIn
          savedData = dataInObj.context || dataInObj;
        } catch (e) {
          console.warn(`Failed to parse data_in for human ${telegramId}, using empty object`);
        }
      }
      
      const context: UserContext = {
        userId: human.id,
        telegramId,
        currentFlow: savedData.currentFlow || '',
        currentStep: savedData.currentStep || 0,
        data: savedData.data || {},
        stepHistory: savedData.stepHistory || [],
        messageForwardingEnabled: savedData.messageForwardingEnabled ?? true,
        flowMode: savedData.flowMode ?? false,
        flowInTopic: savedData.flowInTopic ?? false,
        topicId: savedData.topicId ?? null,
        adminChatId: savedData.adminChatId ?? null,
        targetUserId: savedData.targetUserId ?? null
      };
      
      console.log(`📚 Context loaded from DB for human ${telegramId}:`, {
        currentFlow: context.currentFlow,
        currentStep: context.currentStep,
        flowMode: context.flowMode
      });
      
      return context;
    } catch (error) {
      console.error(`❌ Error loading context for human ${telegramId}:`, error);
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
      messageForwardingEnabled: true, // Enabled by default
      flowMode: false, // By default not in flow
      flowInTopic: false, // By default not in topic flow
      topicId: null,
      adminChatId: null,
      targetUserId: null
    };
    
    // Immediately save to DB
    await this.saveContextToDatabase(context);
    console.log(`✅ Context created and saved to DB for user ${telegramId}`);
    return context;
  }
  
  async updateContext(telegramId: number, updates: Partial<UserContext>): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      Object.assign(context, updates);
      console.log(`🔄 Context updated for user ${telegramId}:`, updates);
      
      // Save updated context to DB
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
      // Save updated context to DB
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

  // Methods for managing message forwarding
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

  // Methods for managing flow mode
  async enterFlowMode(telegramId: number): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      context.flowMode = true;
      context.messageForwardingEnabled = false; // Automatically disable forwarding
      console.log(`🎯 User ${telegramId} ENTERED flow mode (forwarding auto-disabled)`);
      await this.saveContextToDatabase(context);
    }
  }

  async exitFlowMode(telegramId: number): Promise<void> {
    const context = await this.getContext(telegramId);
    if (context) {
      context.flowMode = false;
      context.messageForwardingEnabled = true; // Automatically enable forwarding back
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

  // Save context to DB
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
      flowMode: context.flowMode,
      flowInTopic: context.flowInTopic,
      topicId: context.topicId,
      adminChatId: context.adminChatId,
      targetUserId: context.targetUserId
    };
    
    // Get existing human to preserve other data_in fields
    const human = await this.d1Storage.getHumanByTelegramId(context.telegramId);
    let dataInObj: any = {};
    
    if (human && human.dataIn) {
      try {
        dataInObj = JSON.parse(human.dataIn);
      } catch (e) {
        console.warn(`Failed to parse existing data_in for human ${context.telegramId}, using empty object`);
      }
    }
    
    // Ensure telegram_id is in data_in
    if (!dataInObj.telegram_id) {
      dataInObj.telegram_id = context.telegramId;
    }
    
    // Store context in data_in
    dataInObj.context = contextData;
    
    console.log(`💾 Saving context to database for human ${context.telegramId}`);
    await this.d1Storage.updateHumanDataIn(context.telegramId, JSON.stringify(dataInObj));
    console.log(`✅ Context saved to database for human ${context.telegramId}`);
  }

  // Get or create context
  async getOrCreateContext(telegramId: number, userId: number): Promise<UserContext> {
    let context = await this.getContext(telegramId);
    if (!context) {
      // Create new context
      context = await this.createContext(telegramId, userId);
    }
    return context;
  }

  // Get user language from database
  async getUserLanguage(telegramId: number): Promise<string> {
    if (!this.d1Storage) {
      console.warn('D1Storage not set, using default locale');
      return 'en';
    }

    try {
      const human = await this.d1Storage.getHumanByTelegramId(telegramId);
      
      // Extract language from data_in JSON
      let userLanguage: string | undefined;
      if (human && human.dataIn) {
        try {
          const dataInObj = JSON.parse(human.dataIn);
          userLanguage = dataInObj.language;
        } catch (e) {
          console.warn(`Failed to parse data_in for human ${telegramId}, using default language`);
        }
      }
      
      // Check that language is supported
      // if (userLanguage && ['en', 'ru'].includes(userLanguage)) {
      //   return userLanguage;
      // }
      if (userLanguage) {
        return userLanguage;
      }
      
      return 'en'; // Default fallback
    } catch (error) {
      console.error(`Error getting human language for ${telegramId}:`, error);
      return 'en';
    }
  }
}