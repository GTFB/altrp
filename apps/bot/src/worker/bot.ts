// bot.ts (updated, without customHandlers inside constructor)
import type { Env } from '../worker';
import { KVStorageService } from './kv-storage-service';
import { D1StorageService } from './d1-storage-service';
import { MessageService } from '../core/message-service';
import { TopicService } from '../core/topic-service';
import { SessionService } from '../core/session-service';
import { UserContextManager } from '../core/user-context';
import { FlowEngine } from '../core/flow-engine';
import { I18nService } from '../core/i18n';
import { isVKLink, normalizeVKLink } from '../core/helpers';
//import { createCustomHandlers } from './handlers';
import { createCustomHandlers } from '../config/handlers';
import { commands, findCommand } from '../config/commands';

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
}

export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  text?: string;
  voice?: TelegramVoice;
  photo?: TelegramPhoto[];
  document?: TelegramDocument;
  caption?: string;
  date: number;
}

export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: string;
  title?: string;
}

export interface TelegramVoice {
  file_id: string;
  duration: number;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramPhoto {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  message?: TelegramMessage;
  data?: string;
}

export class TelegramBotWorker {
  private env: Env;
  private kvStorage: KVStorageService;
  private d1Storage: D1StorageService;
  private messageService: MessageService;
  private topicService: TopicService;
  private sessionService: SessionService;
  private userContextManager: UserContextManager;
  private flowEngine: FlowEngine;
  private i18nService: I18nService;

  constructor(env: Env, kvStorage: KVStorageService) {
    this.env = env;
    this.kvStorage = kvStorage;
    this.d1Storage = new D1StorageService(env.DB);
    this.messageService = new MessageService({
      botToken: env.BOT_TOKEN,
      d1Storage: this.d1Storage
    });
    this.topicService = new TopicService({
      botToken: env.BOT_TOKEN,
      adminChatId: parseInt(env.ADMIN_CHAT_ID),
      messageService: this.messageService
    });
    this.sessionService = new SessionService({
      d1Storage: this.d1Storage
    });
    
    // Initialize new components
    this.userContextManager = new UserContextManager();
    this.userContextManager.setD1Storage(this.d1Storage);
    
    // Initialize i18n service
    this.i18nService = new I18nService(env.LOCALE);
    
    // Create FlowEngine without handlers first
    this.flowEngine = new FlowEngine(
      this.userContextManager,
      this.messageService,
      this.i18nService,
      {} // Empty handlers object for now
    );
    
    // Теперь создаем обработчики с доступом к flowEngine
    // Создаем адаптер для совместимости с BotInterface
    const botAdapter = {
      d1Storage: this.d1Storage,
      flowEngine: this.flowEngine,
      env: this.env,
      messageService: this.messageService,
      topicService: this.topicService
    };
    const customHandlers = createCustomHandlers(botAdapter);
    
    // Set handlers in FlowEngine
    this.flowEngine.setCustomHandlers(customHandlers);
    
    console.log('🚀 TelegramBotWorker initialized with new architecture');
  }

  /**
   * Gets user ID from users table by Telegram ID
   */
  private async getDbUserId(telegramUserId: number): Promise<number | null> {
    try {
      const user = await this.d1Storage.getUser(telegramUserId);
      return user && user.id ? user.id : null;
    } catch (error) {
      console.error(`Error getting DB user ID for Telegram user ${telegramUserId}:`, error);
      return null;
    }
  }

  async handleRequest(request: Request): Promise<Response> {
    try {
      console.log('🚀 Bot request received');
      
      // Check request method
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      // Получаем данные обновления от Telegram
      const update = await request.json() as TelegramUpdate;

      console.log('📨 Received update:', JSON.stringify(update, null, 2));

      // Check D1 connection
      console.log('🗄️ D1 database connection:', this.d1Storage ? 'OK' : 'FAILED');
      
      // Initialize D1 Storage (check tables)
      await this.d1Storage.initialize();

      // Process update
      await this.processUpdate(update);

      console.log('✅ Update processed successfully');
      return new Response('OK', { status: 200 });
    } catch (error) {
      console.error('❌ Error handling request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  private async processUpdate(update: TelegramUpdate): Promise<void> {
    try {
      // Process messages
      if (update.message) {
        await this.processMessage(update.message);
      }

      // Process callback requests
      if (update.callback_query) {
        await this.processCallbackQuery(update.callback_query);
      }
    } catch (error) {
      console.error('Error processing update:', error);
    }
  }

  private async processMessage(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;
    const adminChatId = parseInt(this.env.ADMIN_CHAT_ID);

    console.log(`Processing message from user ${userId} in chat ${chatId}`);

    // First process commands (including in topics)
    if (message.text?.startsWith('/')) {
      await this.handleCommand(message);
      return;
    }

    // Check if message came to admin group (topic)
    if (chatId === adminChatId && (message as any).message_thread_id) {
      // This is a message in admin group topic - forward to user
      await this.topicService.handleMessageFromTopic(
        message, 
        this.d1Storage.getUserIdByTopic.bind(this.d1Storage),
        this.getDbUserId.bind(this)
      );
      return;
    }

    // Add user to database
    await this.ensureUserExists(message.from);

    // Get dbUserId for logging
    const user = await this.d1Storage.getUser(message.from.id);
    if (!user) {
      console.error(`User ${message.from.id} not found in database for logging`);
      return;
    }

    // Log message
    if (user.id) {
      await this.messageService.logMessage(message, 'incoming', user.id);
    }

    // Get or create user context
    if (user.id) {
      await this.userContextManager.getOrCreateContext(message.from.id, user.id);
    }
    
    // Check if user is in flow mode
    const isInFlow = await this.userContextManager.isInFlowMode(message.from.id);
    
    if (isInFlow && message.text) {
      // User in flow - process through FlowEngine
      console.log(`🎯 User ${message.from.id} is in flow mode, processing through FlowEngine`);
      await this.flowEngine.handleIncomingMessage(message.from.id, message.text);
      return;
    }

    // Process all message types (considering forwarding settings)
    await this.handleAllMessages(message);
  }

  private async processCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    console.log(`Processing callback query from user ${userId}: ${data}`);

    // Get dbUserId for logging
    const user = await this.d1Storage.getUser(callbackQuery.from.id);
    if (!user) {
      console.error(`User ${callbackQuery.from.id} not found in database for logging`);
      return;
    }

    // Process callback query through MessageService (logging + response)
    if (user.id) {
      await this.messageService.handleCallbackQuery(callbackQuery, user.id);
    }

    // Get or create user context  
    if (user.id) {
      await this.userContextManager.getOrCreateContext(userId, user.id);
    }
    
    // Universal processing of all callbacks through FlowEngine
    // If user pressed button - they are already interacting with bot
    const context = await this.userContextManager.getContext(userId);
    
    console.log(`🔍 Callback processing for user ${userId}:`);
    console.log(`  - Current flow: ${context?.currentFlow || 'none'}`);
    console.log(`  - Current step: ${context?.currentStep || 'none'}`);
    console.log(`  - Callback data: ${data}`);
    
    if (data) {
      console.log(`🎯 Processing callback through FlowEngine`);
      await this.flowEngine.handleIncomingCallback(userId, data);
    }
  }

  private async ensureUserExists(user: TelegramUser): Promise<void> {
    try {
      const existingUser = await this.d1Storage.getUser(user.id);
      
      if (!existingUser) {
        // User will be registered on /start command
        console.log(`User ${user.id} not found in database - will be registered on /start command`);
      }
    } catch (error) {
      console.error(`Error checking if user exists:`, error);
    }
  }

  private async handleCommand(message: TelegramMessage): Promise<void> {
    let command = message.text?.split(' ')[0];
    const userId = message.from.id;
    const chatId = message.chat.id;

    // Clean command from bot mention (@botname)
    if (command && command.includes('@')) {
      command = command.split('@')[0];
    }

    console.log(`Handling command: ${command} from user ${userId}`);

    // Find command in configuration
    const commandConfig = findCommand(command || '');
    
    if (!commandConfig) {
      console.log(`Unknown command: ${command}`);
      const dbUserId = await this.getDbUserId(chatId);
      if (dbUserId) {
        await this.messageService.sendMessage(chatId, 'Unknown command. Use /help for list of commands.', dbUserId);
      }
      return;
    }

    // Execute command handler
    const handlerName = commandConfig.handlerName;
    console.log(`Executing command handler: ${handlerName}`);

    // Get handlers from FlowEngine
    const handlers = this.flowEngine['customHandlers'] || {};
    const handler = handlers[handlerName];
    
    if (handler) {
      try {
        await handler(message, this);
      } catch (error) {
        console.error(`❌ Error executing command handler "${handlerName}":`, error);
      }
    } else {
      console.error(`❌ Command handler "${handlerName}" not found`);
    }
  }


  // Method to check delayed messages (triggered by cron)
  async checkDelayedMessages(): Promise<void> {
    try {
      console.log('Checking delayed messages...');
      
      // Get all users
      const users = await this.d1Storage.getAllUsers();
      
      for (const user of users) {
        await this.checkUserDelayedMessage(user);
      }
    } catch (error) {
      console.error('Error checking delayed messages:', error);
    }
  }

  private async checkUserDelayedMessage(user: any): Promise<void> {
    try {
      console.log(`Checking user ${user.telegramId} for delayed messages`);
      
      // Get user data
      const userData = user.data ? JSON.parse(user.data) : {};
      if (!userData.confirmation) {
        console.log(`No confirmation data for user ${user.telegramId}`);
        return;
      }
      
      console.log(`User ${user.telegramId} user data:`, JSON.stringify(userData, null, 2));
      
      // Check if subscriptions are confirmed
      if (!userData.confirmation || !userData.confirmation.tg || !userData.confirmation.vk) {
        console.log(`No confirmation for user ${user.telegramId}`);
        return;
      }
      
      // Check if one hour has passed since confirmation
      const dateTimeStr = userData.confirmation.date_time;
      console.log(`Checking confirmation time: ${dateTimeStr}`);
      
      // Parse date in UTC ISO format
      const confirmationTime = new Date(dateTimeStr);
      
      if (isNaN(confirmationTime.getTime())) {
        console.log(`Invalid date format: ${dateTimeStr}`);
        return;
      }
      
      // Current time in UTC
      const now = new Date();
      
      // Calculate difference in milliseconds
      const timeDiff = now.getTime() - confirmationTime.getTime();
      const oneHourInMs = 60 * 60 * 1000;
      
      console.log(`Confirmation time: ${confirmationTime.toISOString()}`);
      console.log(`Current time: ${now.toISOString()}`);
      console.log(`Time difference: ${timeDiff}ms (${Math.round(timeDiff / 1000 / 60)} minutes)`);
      console.log(`One hour in ms: ${oneHourInMs}`);
      
      if (timeDiff < oneHourInMs) {
        console.log(`Not yet an hour passed for user ${user.telegramId} (${Math.round(timeDiff / 1000 / 60)} minutes ago)`);
        return; // Less than one hour passed
      }
      
      // Ensure the message has not already been sent
      if (userData.additional_messages && userData.additional_messages.some((msg: any) => msg.message_1)) {
        return; // Already sent
      }
      
      // Send message
      await this.sendDelayedMessage(user.telegramId);
      
      // Update user data
      const currentDateTime = new Date().toISOString();
      
      const additionalMessages = userData.additional_messages || [];
      additionalMessages.push({
        message_1: currentDateTime
      });
      
      userData.additional_messages = additionalMessages;
      await this.d1Storage.updateUserData(user.telegramId, JSON.stringify(userData));
      console.log(`Delayed message sent to user ${user.telegramId}`);
      
    } catch (error) {
      console.error(`Error checking delayed message for user ${user.telegramId}:`, error);
    }
  }

  private async sendDelayedMessage(userId: number): Promise<void> {
    const message = `By the way, did you know that with MaikLoriss you can not only look great, but also earn well? 💰

✨ Want to buy our cosmetics with a HUGE discount and get cashback for every purchase?
✨ Or maybe you're interested in sharing the products with friends and family and building a business with us?

All the opportunities are waiting for you on our website! Jump in, explore, and join our friendly team!`;

    const dbUserId = await this.getDbUserId(userId);
    if (dbUserId) {
      await this.messageService.sendMessage(userId, message, dbUserId);
    }
  }

  private async handleAllMessages(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;

    // Get user information
    const user = await this.d1Storage.getUser(userId);
    
    if (!user) {
      console.log(`User ${userId} not found`);
      return;
    }
    
    // Check if message forwarding is enabled
    const forwardingEnabled = await this.userContextManager.isMessageForwardingEnabled(userId);
    
    if (forwardingEnabled && user.topicId) {
      // Forward message to user's topic only if forwarding is enabled
      await this.topicService.forwardMessageToUserTopic(userId, user.topicId, message);
      console.log(`📬 Message forwarded to topic for user ${userId}`);
    } else {
      console.log(`📪 Message forwarding disabled for user ${userId} - not forwarding to topic`);
    }
  }

}