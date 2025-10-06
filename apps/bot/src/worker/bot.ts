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
    
    // Now create handlers with access to flowEngine
    const customHandlers = createCustomHandlers(this);
    
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

      // Get update data from Telegram
      const update: TelegramUpdate = await request.json();
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

    // Check if user is waiting for VK link (legacy logic)
    if (message.text) {
      const userData = user?.data ? JSON.parse(user.data) : {};
      if (userData.waitingForVK) {
        // User in VK link waiting state - process as VK link
        await this.handleVKLink(message.from.id, message.text);
        return;
      }
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

    switch (command) {
      case '/start':
        await this.handleStartCommandFlow(message);
        break;

      case '/menu':
        await this.handleMenuCommandFlow(message);
        break;
      
      case '/help':
        const dbUserId1 = await this.getDbUserId(chatId);
        if (dbUserId1) {
          await this.messageService.sendMessage(chatId, 'Available commands:\n/start - start working\n/help - help', dbUserId1);
        }
        break;
      
      
      case '/confirmed':
        await this.handleConfirmedCommand(message);
        break;
      
      case '/not_confirmed':
        await this.handleNotConfirmedCommand(message);
        break;
           
      default:
        const dbUserId2 = await this.getDbUserId(chatId);
        if (dbUserId2) {
          await this.messageService.sendMessage(chatId, 'Unknown command. Use /help for list of commands.', dbUserId2);
        }
    }
  }

  private async handleStartCommandFlow(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;

    console.log(`🚀 Handling /start command via flow for user ${userId}`);

    // Get or create user in database to get dbUserId
    let existingUser = await this.d1Storage.getUser(userId);
    
    if (!existingUser) {
      // Create topic in admin group for new user
      const topicId = await this.topicService.createTopicInAdminGroup(userId, message.from);
      
      // Register user minimally to get dbUserId
      const newUser = {
        telegramId: userId,
        firstName: message.from.first_name,
        lastName: message.from.last_name || '',
        username: message.from.username || '',
        registeredAt: new Date().toISOString(),
        topicId: topicId || 0
      };

      await this.d1Storage.addUser(newUser);
      console.log(`✅ New user ${userId} registered for start flow`);
      
      // Update user reference
      existingUser = await this.d1Storage.getUser(userId);
    }

    if (!existingUser || !existingUser.id) {
      console.error(`Cannot start flow: user ${userId} registration failed`);
      return;
    }

    // Get or create user context
    await this.userContextManager.getOrCreateContext(userId, existingUser.id);
    
    // Save info about the current message for handlers
    await this.userContextManager.setVariable(userId, '_system.currentMessage', message);

    // Start registration flow
    await this.flowEngine.startFlow(userId, 'start_registration');

    console.log(`✅ Start flow launched for user ${userId}`);
  }

  private async handleMenuCommandFlow(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;

    console.log(`🚀 Handling /menu command via flow for user ${userId}`);
   
    // Start registration flow
    await this.flowEngine.startFlow(userId, 'menu');

    console.log(`✅ Menu flow launched for user ${userId}`);
  }

  // Keep old method as legacy (can be removed later)
  private async handleStartCommandLegacy(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;

    console.log(`Handling /start command from user ${userId}`);

    // Check if the user already exists in the database
    const existingUser = await this.d1Storage.getUser(userId);
    
    if (!existingUser) {
        // Create a topic in the admin group
      const topicId = await this.topicService.createTopicInAdminGroup(userId, message.from);
      
      if (topicId) {
        // Register user with topic_id
        const newUser = {
          telegramId: userId,
          firstName: message.from.first_name,
          lastName: message.from.last_name || '',
          username: message.from.username || '',
          registeredAt: new Date().toISOString(),
          topicId: topicId
        };

        await this.d1Storage.addUser(newUser);
        console.log(`New user ${userId} registered with topic ${topicId}`);

      } else {
        // If topic creation failed, register without it
        const newUser = {
          telegramId: userId,
          firstName: message.from.first_name,
          lastName: message.from.last_name || '',
          username: message.from.username || '',
          registeredAt: new Date().toISOString()
        };

        await this.d1Storage.addUser(newUser);
        console.log(`New user ${userId} registered without topic`);
      }
    } else {
      // User already exists
      console.log(`User ${userId} already exists in database`);
    }

    // Get dbUserId to send messages (user definitely exists now)
    const dbUserId = await this.getDbUserId(chatId);
    if (!dbUserId) {
      console.error(`Cannot send start message: user ${userId} not found in database after registration`);
      return;
    }

    // Always send a welcome message with a button
    const welcomeMessage = `123`;
    
    await this.messageService.sendMessageWithKeyboard(chatId, welcomeMessage, {
      inline_keyboard: [[
        {
          text: "🚀 Start",
          callback_data: "start_flow"
        }
      ]]
    }, dbUserId);
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


  private async handleVKLink(userId: number, vkLink: string): Promise<void> {
    try {
      // Normalize VK link
      let normalizedLink = vkLink.trim();
      if (normalizedLink.startsWith('@')) {
        normalizedLink = `https://vk.com/${normalizedLink.substring(1)}`;
      } else if (!normalizedLink.startsWith('http')) {
        normalizedLink = `https://vk.com/${normalizedLink}`;
      }

      // Save VK link and reset waiting state
      const user = await this.d1Storage.getUser(userId);
      const userData = user?.data ? JSON.parse(user.data) : {};
      userData.vk = normalizedLink;
      delete userData.waitingForVK;
      await this.d1Storage.updateUserData(userId, JSON.stringify(userData));
      
      console.log(`VK link saved for user ${userId}: ${normalizedLink}`);

      // Send a checking message
      const dbUserId = await this.getDbUserId(userId);
      if (dbUserId) {
        await this.messageService.sendMessage(userId, "Whoosh! 🔍 Checking...", dbUserId);
      }

      // Use previously fetched user data for topic
      if (user && user.topicId) {
        const currentDateTime = new Date().toLocaleString('en-US', {
          timeZone: 'Europe/Moscow',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        const topicMessage = `The user requests to check subscriptions in groups

ID: ${userId}
Username: @${user.username || 'not specified'}
Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() + `
VK: ${normalizedLink}

Date and time: ${currentDateTime}`;

        const adminChatId = parseInt(this.env.ADMIN_CHAT_ID);
        await this.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
        
        console.log(`Check subscription request sent to topic ${user.topicId} for user ${userId}`);
      }

    } catch (error) {
      console.error(`Error handling VK link for user ${userId}:`, error);
    }
  }


  // Legacy handleCallbackData removed - all callbacks are now handled via FlowEngine

  // Legacy handleStartFlowCallback removed - FlowEngine is used now

  // Legacy handleCheckSubscriptionCallback removed - FlowEngine is used now

  private async handleConfirmedCommand(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;
    const adminChatId = parseInt(this.env.ADMIN_CHAT_ID);
    const topicId = (message as any).message_thread_id;

    console.log(`Handling /confirmed command from user ${userId} in topic ${topicId}`);

    // Ensure the command is executed in the admin group
    if (chatId !== adminChatId) {
      console.log(`/confirmed command ignored - not in admin group`);
      return;
    }

    // Ensure the command is executed inside a topic
    if (!topicId) {
      console.log(`/confirmed command ignored - not in topic`);
      return;
    }

    // Find user by topic_id
    const targetUserId = await this.d1Storage.getUserIdByTopic(topicId);
    
    if (!targetUserId) {
      console.log(`No user found for topic ${topicId}`);
      return;
    }

    console.log(`Found user ${targetUserId} for topic ${topicId}`);

    // Get user data
    const user = await this.d1Storage.getUser(targetUserId);
    
    if (user) {
      // Add subscription confirmation with time in UTC
      const currentDateTime = new Date().toISOString();

      // Update user data
      const targetUser = await this.d1Storage.getUser(targetUserId);
      const targetUserData = targetUser?.data ? JSON.parse(targetUser.data) : {};
      targetUserData.confirmation = {
        tg: true,
        vk: true,
        date_time: currentDateTime
      };
      await this.d1Storage.updateUserData(targetUserId, JSON.stringify(targetUserData));
      
      console.log(`User ${targetUserId} session updated with confirmation`);
    }

    // Send message to user
    const messageText = `Yes! You're one of us! Subscriptions are confirmed!
Now you're participating in the giveaway!

We'll announce the results on our social networks — stay tuned and good luck! 🍀`;

    const dbUserId3 = await this.getDbUserId(targetUserId);
    if (dbUserId3) {
      await this.messageService.sendMessage(targetUserId, messageText, dbUserId3);
    }
    console.log(`Confirmed message sent to user ${targetUserId}`);
  }

  private async handleNotConfirmedCommand(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;
    const adminChatId = parseInt(this.env.ADMIN_CHAT_ID);
    const topicId = (message as any).message_thread_id;

    console.log(`Handling /not_confirmed command from user ${userId} in topic ${topicId}`);

    // Ensure the command is executed in the admin group
    if (chatId !== adminChatId) {
      console.log(`/not_confirmed command ignored - not in admin group`);
      return;
    }

    // Ensure the command is executed inside a topic
    if (!topicId) {
      console.log(`/not_confirmed command ignored - not in topic`);
      return;
    }

    // Find user by topic_id
    const targetUserId = await this.d1Storage.getUserIdByTopic(topicId);
    
    if (!targetUserId) {
      console.log(`No user found for topic ${topicId}`);
      return;
    }

    console.log(`Found user ${targetUserId} for topic ${topicId}`);

    // Send message to user
    const messageText = `Hmm... Something doesn't add up! 😕

I can't see your subscription in one of our communities (or both).

Return, make sure you're subscribed to both, and press the "✨ Done! Check!" button again! We are waiting for you!`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "👉 Our Telegram",
            url: "https://t.me/ml_cosmetic"
          }
        ],
        [
          {
            text: "👉 Our VK group",
            url: "https://vk.com/public48764292"
          }
        ],
        [
          {
            text: "✨Done! Check!",
            callback_data: "check_subscription"
          }
        ]
      ]
    };

    const dbUserId5 = await this.getDbUserId(targetUserId);
    if (dbUserId5) {
      await this.messageService.sendMessageWithKeyboard(targetUserId, messageText, keyboard, dbUserId5);
    }
    console.log(`Not confirmed message sent to user ${targetUserId}`);
  }

}