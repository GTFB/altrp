import type { Env } from './worker';
import { KVStorageService } from './kv-storage-service';
import { D1StorageService, type Human } from './d1-storage-service';
import { MessageService } from '../core/message-service';
import { MessageLoggingService } from '../core/message-logging-service';
import { TopicService } from '../core/topic-service';
//import { SessionService } from '../core/session-service';
import { UserContextManager, type UserContext } from '../core/user-context';
import { FlowEngine } from '../core/flow-engine';
//import { I18nService } from '../core/i18n';
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
  //private kvStorage: KVStorageService;
  private d1Storage: D1StorageService;
  private messageLoggingService: MessageLoggingService;
  private messageService: MessageService;
  private topicService: TopicService;
  //private sessionService: SessionService;
  private userContextManager: UserContextManager;
  private flowEngine: FlowEngine;
  //private i18nService: I18nService;

  //constructor(env: Env, kvStorage: KVStorageService) {
  constructor(env: Env) {
    this.env = env;
    //this.kvStorage = kvStorage;
    this.d1Storage = new D1StorageService(env.DB);
    
    // Create message logging service
    this.messageLoggingService = new MessageLoggingService({
      d1Storage: this.d1Storage
    });
    
    this.messageService = new MessageService({
      botToken: env.BOT_TOKEN,
      messageLoggingService: this.messageLoggingService
    });
    this.topicService = new TopicService({
      botToken: env.BOT_TOKEN,
      adminChatId: parseInt(env.ADMIN_CHAT_ID),
      messageService: this.messageService,
      d1Storage: this.d1Storage
    });
    // this.sessionService = new SessionService({
    //   d1Storage: this.d1Storage
    // });
    
    // Initialize new components
    this.userContextManager = new UserContextManager();
    this.userContextManager.setD1Storage(this.d1Storage);
    
    // Initialize i18n service
    //this.i18nService = new I18nService(env.LOCALE);
    
    // Create FlowEngine without handlers first
    this.flowEngine = new FlowEngine(
      this.userContextManager,
      this.messageService,
      //this.i18nService,
      {}, // Empty handlers object for now
      parseInt(env.ADMIN_CHAT_ID) // Pass admin chat ID for topic flows
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
   * Gets human ID from humans table by Telegram ID
   */
  private async getDbUserId(telegramUserId: number): Promise<number | null> {
    try {
      const human = await this.d1Storage.getHumanByTelegramId(telegramUserId);
      return human && human.id ? human.id : null;
    } catch (error) {
      console.error(`Error getting DB human ID for Telegram user ${telegramUserId}:`, error);
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

  // private async processMessage(message: TelegramMessage): Promise<void> {
  //   const userId = message.from.id;
  //   const chatId = message.chat.id;
  //   const adminChatId = parseInt(this.env.ADMIN_CHAT_ID);

  //   console.log(`Processing message from user ${userId} in chat ${chatId}`);
  //   console.log(`Admin chat ID (hardcoded): ${adminChatId}`);
  //   console.log(`Message thread ID: ${(message as any).message_thread_id}`);

  //   // First process commands (including in topics)
  //   if (message.text?.startsWith('/')) {
  //     await this.handleCommand(message);
  //     return;
  //   }

  //   // Check if message came to admin group (topic)
  //   if (chatId === adminChatId && (message as any).message_thread_id) {
  //     const topicId = (message as any).message_thread_id;
  //     console.log(`✅ Entering topic handling block, topicId: ${topicId}`);
      
  //     // Check if this is a consultant topic
  //     try {
  //       const consultantThread = await this.d1Storage.execute(`
  //         SELECT id 
  //         FROM message_threads 
  //         WHERE value = ? AND type = 'consultant' AND deleted_at IS NULL
  //         LIMIT 1
  //       `, [topicId.toString()]);

  //       if (consultantThread && consultantThread.length > 0) {
  //         // This is a consultant topic - handle with AI
  //         console.log(`Processing message in consultant topic ${topicId}`);
          
  //         //if (message.text) {
  //           // Get handlers and call handleConsultantTopicMessage
  //           const handlers = this.flowEngine['customHandlers'] || {};
  //           if (handlers.handleConsultantTopicMessage) {
  //             await handlers.handleConsultantTopicMessage(message);
  //           }
  //         //}
  //         return;
  //       }
  //     } catch (error) {
  //       console.error('Error checking consultant topic:', error);
  //     }

  //     // Try to handle as user topic (old bot logic)
  //     // Wrapped in try-catch to handle missing users table gracefully
  //     try {
  //       await this.topicService.handleMessageFromTopic(
  //         message, 
  //         this.d1Storage.getUserIdByTopic.bind(this.d1Storage),
  //         this.getDbUserId.bind(this)
  //       );
  //     } catch (error) {
  //       console.log(`Message in topic ${topicId} is not a user or consultant topic, ignoring`);
  //     }
  //     return;
  //   }

  //   // Skip all user-related logic for consultant bot
  //   // Consultant bot only handles messages in topics
  // }

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
      const topicId = (message as any).message_thread_id;
      
      // Check if admin is in topic flow mode
      const adminContext = await this.userContextManager.getContext(userId);
      if (adminContext && adminContext.flowInTopic && adminContext.topicId === topicId && message.text) {
        // Admin is managing flow in this topic - process through FlowEngine
        console.log(`🎯 Admin ${userId} is in topic flow mode, processing message through FlowEngine`);
        await this.flowEngine.handleTopicMessage(userId, message.text);
        return;
      }
      
      // Otherwise, forward message to human (normal topic behavior)
      await this.topicService.handleMessageFromTopic(
        message, 
        this.d1Storage.getHumanTelegramIdByTopic.bind(this.d1Storage),
        this.getDbUserId.bind(this)
      );
      return;
    }

    // Add human to database
    await this.ensureHumanExists(message.from);

    // Get dbHumanId for logging
    const human = await this.d1Storage.getHumanByTelegramId(message.from.id);
    if (!human) {
      console.error(`Human ${message.from.id} not found in database for logging`);
      return;
    }

    // Log message
    if (human.id) {
      await this.messageLoggingService.logMessage(message, 'incoming', human.id);
    }

    // Get or create human context
    if (human.id) {
      await this.userContextManager.getOrCreateContext(message.from.id, human.id);
    }
    
    // Check if human is in flow mode
    const isInFlow = await this.userContextManager.isInFlowMode(message.from.id);
    
    if (isInFlow && message.text) {
      // Human in flow - process through FlowEngine
      console.log(`🎯 Human ${message.from.id} is in flow mode, processing through FlowEngine`);
      await this.flowEngine.handleIncomingMessage(message.from.id, message.text);
      return;
    }

    // Process all message types (considering forwarding settings)
    await this.handleAllMessages(message);
  }

  private async processCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;
    const adminChatId = parseInt(this.env.ADMIN_CHAT_ID);

    console.log(`Processing callback query from human ${userId}: ${data}`);

    // Check if callback is from admin group topic
    const message = callbackQuery.message;
    const chatId = message?.chat?.id;
    const topicId = (message as any)?.message_thread_id;

    // Check if admin is in topic flow mode
    if (chatId === adminChatId && topicId) {
      const adminContext = await this.userContextManager.getContext(userId);
      if (adminContext && adminContext.flowInTopic && adminContext.topicId === topicId && data) {
        // Admin is managing flow in this topic - process through FlowEngine
        console.log(`🎯 Admin ${userId} is in topic flow mode, processing callback through FlowEngine`);
        await this.messageService.answerCallbackQuery(callbackQuery.id);
        await this.flowEngine.handleTopicCallback(userId, data);
        return;
      }
    }

    // Get dbHumanId for logging
    const human = await this.d1Storage.getHumanByTelegramId(callbackQuery.from.id);
    if (!human) {
      console.error(`Human ${callbackQuery.from.id} not found in database for logging`);
      return;
    }

    // Process callback query through MessageService (logging + response)
    if (human.id) {
      await this.messageService.handleCallbackQuery(callbackQuery, human.id);
    }

    // Get or create human context  
    if (human.id) {
      await this.userContextManager.getOrCreateContext(userId, human.id);
    }
    
    // Universal processing of all callbacks through FlowEngine
    // If human pressed button - they are already interacting with bot
    const context = await this.userContextManager.getContext(userId);
    
    console.log(`🔍 Callback processing for human ${userId}:`);
    console.log(`  - Current flow: ${context?.currentFlow || 'none'}`);
    console.log(`  - Current step: ${context?.currentStep || 'none'}`);
    console.log(`  - Callback data: ${data}`);
    
    if (data) {
      console.log(`🎯 Processing callback through FlowEngine`);
      await this.flowEngine.handleIncomingCallback(userId, data);
    }
  }

  private async ensureHumanExists(user: TelegramUser): Promise<void> {
    try {
      const exists = await this.d1Storage.humanExists(user.id);
      
      if (!exists) {
        // Human will be registered on /start command
        console.log(`Human ${user.id} not found in database - will be registered on /start command`);
      }
    } catch (error) {
      console.error(`Error checking if human exists:`, error);
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


  // TODO Method to check delayed messages (triggered by cron)
  async checkDelayedMessages(): Promise<void> {
    try {
      console.log('Checking delayed messages...');
      
      // Get all users
      // const users = await this.d1Storage.getAllUsers();
      
      // for (const user of users) {
      //   await this.checkUserDelayedMessage(user);
      // }
    } catch (error) {
      console.error('Error checking delayed messages:', error);
    }
  }


  private async handleAllMessages(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;

    //console.log(`YYYYYYYYY`);

    // Get human information
    const human = await this.d1Storage.getHumanByTelegramId(userId);
    
    if (!human) {
      console.log(`Human ${userId} not found`);
      return;
    }
    
    // Extract topicId from data_in JSON
    let topicId: number | undefined;
    let dataInObj = null;
    if (human.dataIn) {
      try {
        dataInObj = JSON.parse(human.dataIn);
        topicId = dataInObj.topic_id;
      } catch (e) {
        console.warn(`Failed to parse data_in for human ${userId}, topic_id not available`);
      }
    }

    //console.log(`OKKKKKKK`);
    
    // Check if message forwarding is enabled
    const forwardingEnabled = await this.userContextManager.isMessageForwardingEnabled(userId);
    
    if (forwardingEnabled && topicId) {
      // Forward message to human's topic only if forwarding is enabled
      await this.topicService.forwardMessageToUserTopic(userId, topicId, message);
      console.log(`📬 Message forwarded to topic for human ${userId}`);

      console.log(`human.dataIn ${userId}`, dataInObj.ai_enabled, dataInObj.dataIn);

      // Get handlers and call handleConsultantTopicMessage
      const handlers = this.flowEngine['customHandlers'] || {};
      if (handlers.handleConsultantTopicMessage && dataInObj.topic_id && dataInObj.ai_enabled) {
        await handlers.handleConsultantTopicMessage(message);
      }

    } else {
      console.log(`📪 Message forwarding disabled for human ${userId} - not forwarding to topic`);
    }
  }

}