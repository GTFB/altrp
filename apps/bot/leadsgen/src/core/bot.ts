import type { Env } from './env';
import { HumanRepository } from '../repositories/HumanRepository';
import { MessageRepository } from '../repositories/MessageRepository';
import { MessageThreadRepository } from '../repositories/MessageThreadRepository';
import { FlowEngine } from '../core/flow-engine';
import { TopicService } from '../core/topic-service';
import { D1StorageService } from '../worker/d1-storage-service';
import { MessageService } from '../core/message-service';
import { createCustomHandlers } from '../config/handlers';
import { commands, findCommand } from '../config/commands';
import { MessageLoggingService } from '../core/message-logging-service';
import { UserContextManager, type UserContext } from '../core/user-context';

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
  private botType: string;
  //private kvStorage: KVStorageService;
  private d1Storage: D1StorageService;
  private humanRepository: HumanRepository;
  private messageRepository: MessageRepository;
  private messageThreadRepository: MessageThreadRepository;
  private messageLoggingService: MessageLoggingService;
  private messageService: MessageService;
  private topicService: TopicService;
  //private sessionService: SessionService;
  private userContextManager: UserContextManager;
  private flowEngine: FlowEngine;
  private defaultAdminChatId?: number;
  private cachedAdminChatIds: number[] | null = null;
  //private i18nService: I18nService;

  //constructor(env: Env, kvStorage: KVStorageService) {
  constructor(env: Env) {
    this.env = env;
    this.botType = env.BOT_TYPE || '';
    this.defaultAdminChatId = env.ADMIN_CHAT_ID ? parseInt(env.ADMIN_CHAT_ID) : undefined;
    if (typeof this.defaultAdminChatId === 'number' && Number.isNaN(this.defaultAdminChatId)) {
      this.defaultAdminChatId = undefined;
    }
    //this.kvStorage = kvStorage;
    this.d1Storage = new D1StorageService(env.DB);
    
    // Create human model
    this.humanRepository = new HumanRepository({ db: env.DB });
    
    // Create message thread repository (needed for message repository)
    this.messageThreadRepository = new MessageThreadRepository({ db: env.DB, d1Storage: this.d1Storage });
    
    // Create message model
    this.messageRepository = new MessageRepository({ 
      db: env.DB, 
      humanRepository: this.humanRepository,
      messageThreadRepository: this.messageThreadRepository,
      botType: this.botType
    });
    
    // Initialize user context manager (needed for message logging service)
    this.userContextManager = new UserContextManager();
    this.userContextManager.setD1Storage(this.d1Storage);
    this.userContextManager.setHumanRepository(this.humanRepository);
    
    // Create message logging service
    this.messageLoggingService = new MessageLoggingService({
      d1Storage: this.d1Storage,
      humanRepository: this.humanRepository,
      messageRepository: this.messageRepository,
      userContextManager: this.userContextManager
    });
    
    this.messageService = new MessageService({
      botToken: env.BOT_TOKEN,
      messageLoggingService: this.messageLoggingService
    });
    this.topicService = new TopicService({
      botToken: env.BOT_TOKEN,
      adminChatId: this.defaultAdminChatId,
      messageService: this.messageService,
      messageLoggingService: this.messageLoggingService
    });
    // this.sessionService = new SessionService({
    //   d1Storage: this.d1Storage
    // });
    
    // Initialize i18n service
    //this.i18nService = new I18nService(env.LOCALE);
    
    // Create FlowEngine without handlers first
    this.flowEngine = new FlowEngine(
      this.userContextManager,
      this.messageService,
      //this.i18nService,
      {}, // Empty handlers object for now
      this.defaultAdminChatId // Pass admin chat ID for topic flows
    );
    
    // Теперь создаем обработчики с доступом к flowEngine
    // Создаем адаптер для совместимости с BotInterface
    const botAdapter = {
      d1Storage: this.d1Storage,
      humanRepository: this.humanRepository,
      messageRepository: this.messageRepository,
      messageThreadRepository: this.messageThreadRepository,
      flowEngine: this.flowEngine,
      env: this.env,
      messageService: this.messageService,
      topicService: this.topicService,
      userContextManager: this.userContextManager
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
      const human = await this.humanRepository.getHumanByTelegramId(telegramUserId);
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

    console.log(`Processing message from user ${userId} in chat ${chatId}`);

    // First process commands (including in topics)
    if (message.text?.startsWith('/')) {
      await this.handleCommand(message);
      return;
    }

    // Check if message came to a topic (message_thread_id present)
    const topicId = (message as any).message_thread_id as number | undefined;
    if (topicId) {
      // Try to resolve user (Telegram ID) linked to this topic
      const targetUserId = await this.resolveHumanTelegramIdByTopic(topicId);

      if (targetUserId) {
        // Check if admin is in topic flow mode (for admin flows in topic)
        const adminContext = await this.userContextManager.getContext(userId);
        if (adminContext && adminContext.flowInTopic && adminContext.topicId === topicId && message.text) {
          console.log(`🎯 Admin ${userId} is in topic flow mode, processing message through FlowEngine`);
          await this.flowEngine.handleTopicMessage(userId, message.text);
          return;
        }

        // Check if message forwarding is enabled for this user
        const forwardingEnabled = await this.userContextManager.isMessageForwardingEnabled(targetUserId);
        if (!forwardingEnabled) {
          console.log(`📪 Message forwarding disabled for user ${targetUserId} - not forwarding from topic`);
          return;
        }

        // Forward message from topic to user using TopicService
        await this.topicService.handleMessageFromTopic(
          message,
          async () => targetUserId,
          this.getDbUserId.bind(this)
        );
        return;
      }

      console.log(`📭 No user linked to topic ${topicId}, skipping topic-to-user forwarding`);
      // Fall through to regular processing (logging, flows, etc.)
    }

    // Get dbHumanId for logging
    const human = await this.humanRepository.getHumanByTelegramId(message.from.id);
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
    
    // Check if human is in dialog mode
    if (message.text) {
      const handlers = this.flowEngine['customHandlers'] || {};
      if (handlers.handleDialogMessage) {
        const handled = await handlers.handleDialogMessage(message.from.id, message.text);
        if (handled) {
          console.log(`💬 Message handled as dialog message for user ${message.from.id}`);
          return;
        }
      }
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

    console.log(`Processing callback query from human ${userId}: ${data}`);

    // Check if callback is from admin group topic
    const message = callbackQuery.message;
    const chatId = message?.chat?.id;
    const topicId = (message as any)?.message_thread_id;
    const isAdminChat = chatId ? await this.isAdminChat(chatId) : false;

    // Check if admin is in topic flow mode
    if (isAdminChat && topicId) {
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
    const human = await this.humanRepository.getHumanByTelegramId(callbackQuery.from.id);
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

  private async handleCommand(message: TelegramMessage): Promise<void> {
    let command = message.text?.split(' ')[0];
    const userId = message.from.id;
    const chatId = message.chat.id;

    // Clean command from bot mention (@botname)
    if (command && command.includes('@')) {
      command = command.split('@')[0];
    }

    console.log(`Handling command: ${command} from user ${userId}`);

    // Exit dialog mode if user is in dialog
    const handlers = this.flowEngine['customHandlers'] || {};
    if (handlers.exitDialogMode) {
      await handlers.exitDialogMode(userId);
    }

    // Find command in configuration
    const commandConfig = findCommand(command || '');
    
    if (!commandConfig) {
      console.log(`Unknown command: ${command}`);
      const dbHumanId = await this.getDbUserId(chatId);
      if (dbHumanId) {
        await this.messageService.sendMessage(chatId, 'Unknown command. Use /help for list of commands.', dbHumanId);
      }
      return;
    }

    // Execute command handler
    const handlerName = commandConfig.handlerName;
    console.log(`Executing command handler: ${handlerName}`);

    // Get handler from FlowEngine (handlers already declared above)
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

    // Get human information
    const human = await this.humanRepository.getHumanByTelegramId(userId);
    
    if (!human) {
      console.log(`Human ${userId} not found`);
      return;
    }
    
    // Extract topicId from data_in JSON
    let topicId: number | undefined;
    let topicChatId: number | undefined;
    let dataInObj: any = null;
    if (human.dataIn) {
      try {
        dataInObj = JSON.parse(human.dataIn);
        topicId = dataInObj?.topic_id;
        topicChatId = dataInObj?.topic_chat_id;
      } catch (e) {
        console.warn(`Failed to parse data_in for human ${userId}, topic_id not available`);
      }
    }

    // Check if message forwarding is enabled
    const forwardingEnabled = await this.userContextManager.isMessageForwardingEnabled(userId);
    
    if (forwardingEnabled && topicId) {
      // Forward message to human's topic only if forwarding is enabled
      await this.topicService.forwardMessageToUserTopic(userId, topicId, message, topicChatId);
      console.log(`📬 Message forwarded to topic for human ${userId}`);

      console.log(`human.dataIn ${userId}`, dataInObj?.ai_enabled, dataInObj?.dataIn);

      // Get handlers and call handleAssistantTopicMessage
      const handlers = this.flowEngine['customHandlers'] || {};
      if (handlers.handleAssistantTopicMessage && dataInObj?.topic_id && dataInObj?.ai_enabled) {
        await handlers.handleAssistantTopicMessage(message);
      }

    } else {
      console.log(`📪 Message forwarding disabled for human ${userId} - not forwarding to topic`);
    }
  }

  private async getAdminChatIds(): Promise<number[]> {
    if (this.cachedAdminChatIds) {
      return this.cachedAdminChatIds;
    }

    const ids = new Set<number>();
    if (typeof this.defaultAdminChatId === 'number' && !Number.isNaN(this.defaultAdminChatId)) {
      ids.add(this.defaultAdminChatId);
    }

    try {
      const parentThreads = await this.messageThreadRepository.getParentThreadsByType(this.botType);
      parentThreads.forEach(thread => {
        if (thread.value) {
          const parsed = parseInt(thread.value, 10);
          if (!Number.isNaN(parsed)) {
            ids.add(parsed);
          }
        }
      });
    } catch (error) {
      console.error('Error loading admin chat IDs from message_threads:', error);
    }

    this.cachedAdminChatIds = Array.from(ids);
    return this.cachedAdminChatIds;
  }

  private async isAdminChat(chatId: number): Promise<boolean> {
    const adminIds = await this.getAdminChatIds();
    return adminIds.includes(chatId);
  }

  private async resolveHumanTelegramIdByTopic(topicId: number): Promise<number | null> {
    try {
      const directId = await this.humanRepository.getHumanTelegramIdByTopic(topicId);
      if (directId) {
        return directId;
      }

      const thread = await this.messageThreadRepository.getMessageThreadByValue(
        topicId.toString(),
        this.botType
      );
      if (thread && thread.xaid) {
        const human = await this.humanRepository.getHumanByHaid(thread.xaid);
        if (!human || !human.dataIn) {
          return null;
        }
        try {
          const data = JSON.parse(human.dataIn);
          return data?.telegram_id ?? null;
        } catch (error) {
          console.warn('Failed to parse human.dataIn while resolving telegram_id by topic:', error);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error resolving human telegram_id by topic:', error);
      return null;
    }
  }
}