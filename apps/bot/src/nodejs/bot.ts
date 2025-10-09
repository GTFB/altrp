// Node.js версия бота - использует PostgreSQL и Redis вместо D1 и KV
import { PostgreSQLStorageService, RedisStorageService } from './storage-service';
import { MessageService } from '../core/message-service';
import { TopicService } from '../core/topic-service';
import { SessionService } from '../core/session-service';
import { UserContextManager } from '../core/user-context';
import { FlowEngine } from '../core/flow-engine';
import { I18nService } from '../core/i18n';
import { isVKLink, normalizeVKLink } from '../core/helpers';
import { createCustomHandlers } from '../config/handlers';

// Интерфейсы для Node.js окружения
export interface NodeEnv {
  BOT_TOKEN: string;
  ADMIN_CHAT_ID: string;
  TRANSCRIPTION_API_TOKEN: string;
  NODE_ENV: string;
  LOCALE: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  PORT?: number;
}

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

export class TelegramBotNode {
  private env: NodeEnv;
  private redisStorage: RedisStorageService;
  private postgresStorage: PostgreSQLStorageService;
  private messageService: MessageService;
  private topicService: TopicService;
  private sessionService: SessionService;
  private userContextManager: UserContextManager;
  private flowEngine: FlowEngine;
  private i18nService: I18nService;

  constructor(env: NodeEnv, redisStorage: RedisStorageService, postgresStorage: PostgreSQLStorageService) {
    this.env = env;
    this.redisStorage = redisStorage;
    this.postgresStorage = postgresStorage;
    
    // Инициализируем сервисы с PostgreSQL вместо D1
    this.messageService = new MessageService({
      botToken: env.BOT_TOKEN,
      d1Storage: this.postgresStorage as any // Приводим к совместимому типу
    });
    
    this.topicService = new TopicService({
      botToken: env.BOT_TOKEN,
      adminChatId: parseInt(env.ADMIN_CHAT_ID),
      messageService: this.messageService
    });
    
    this.sessionService = new SessionService({
      d1Storage: this.postgresStorage as any // Приводим к совместимому типу
    });
    
    // Инициализируем новые компоненты
    this.userContextManager = new UserContextManager();
    this.userContextManager.setD1Storage(this.postgresStorage as any);
    
    // Инициализируем i18n сервис
    this.i18nService = new I18nService(env.LOCALE);
    
    // Создаем FlowEngine без обработчиков сначала
    this.flowEngine = new FlowEngine(
      this.userContextManager,
      this.messageService,
      this.i18nService,
      {} // Пустой объект обработчиков пока
    );
    
    // Теперь создаем обработчики с доступом к flowEngine
    // Создаем адаптер для совместимости с TelegramBotWorker
    const workerAdapter = {
      d1Storage: this.postgresStorage,
      flowEngine: this.flowEngine,
      env: this.env,
      messageService: this.messageService,
      topicService: this.topicService
    };
    const customHandlers = createCustomHandlers(workerAdapter as any);
    
    // Устанавливаем обработчики в FlowEngine
    this.flowEngine.setCustomHandlers(customHandlers);
    
    console.log('🚀 TelegramBotNode initialized with PostgreSQL and Redis');
  }

  /**
   * Получает ID пользователя из таблицы users по Telegram ID
   */
  private async getDbUserId(telegramUserId: number): Promise<number | null> {
    try {
      const user = await this.postgresStorage.getUser(telegramUserId);
      return user && user.id ? user.id : null;
    } catch (error) {
      console.error(`Error getting DB user ID for Telegram user ${telegramUserId}:`, error);
      return null;
    }
  }

  async handleRequest(request: Request): Promise<Response> {
    try {
      console.log('🚀 Bot request received');
      
      // Проверяем метод запроса
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      // Получаем данные обновления от Telegram
      const update = await request.json() as TelegramUpdate;
      console.log('📨 Received update:', JSON.stringify(update, null, 2));

      // Проверяем подключение к PostgreSQL
      console.log('🗄️ PostgreSQL database connection:', this.postgresStorage ? 'OK' : 'FAILED');
      
      // Инициализируем PostgreSQL Storage (проверяем таблицы)
      await this.postgresStorage.initialize();

      // Обрабатываем обновление
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
      // Обрабатываем сообщения
      if (update.message) {
        await this.processMessage(update.message);
      }

      // Обрабатываем callback запросы
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

    // Сначала обрабатываем команды (в том числе в топиках)
    if (message.text?.startsWith('/')) {
      await this.handleCommand(message);
      return;
    }

    // Проверяем, пришло ли сообщение в админ группу (топик)
    if (chatId === adminChatId && (message as any).message_thread_id) {
      // Это сообщение в топике админ группы - пересылаем пользователю
      await this.topicService.handleMessageFromTopic(
        message, 
        this.postgresStorage.getUserIdByTopic.bind(this.postgresStorage),
        this.getDbUserId.bind(this)
      );
      return;
    }

    // Добавляем пользователя в базу данных
    await this.ensureUserExists(message.from);

    // Получаем dbUserId для логирования
    const user = await this.postgresStorage.getUser(message.from.id);
    if (!user) {
      console.error(`User ${message.from.id} not found in database for logging`);
      return;
    }

    // Логируем сообщение
    if (user.id) {
      await this.messageService.logMessage(message, 'incoming', user.id);
    }

    // Получаем или создаем контекст пользователя
    if (user.id) {
      await this.userContextManager.getOrCreateContext(message.from.id, user.id);
    }
    
    // Проверяем, находится ли пользователь в режиме флоу
    const isInFlow = await this.userContextManager.isInFlowMode(message.from.id);
    
    if (isInFlow && message.text) {
      // Пользователь в флоу - обрабатываем через FlowEngine
      console.log(`🎯 User ${message.from.id} is in flow mode, processing through FlowEngine`);
      await this.flowEngine.handleIncomingMessage(message.from.id, message.text);
      return;
    }

    // Проверяем, ожидает ли пользователь VK ссылку (legacy логика)
    if (message.text) {
      const userData = user?.data ? JSON.parse(user.data) : {};
      if (userData.waitingForVK) {
        // Пользователь в состоянии ожидания VK ссылки - обрабатываем как VK ссылку
        await this.handleVKLink(message.from.id, message.text);
        return;
      }
    }

    // Обрабатываем все типы сообщений (с учетом настроек пересылки)
    await this.handleAllMessages(message);
  }

  private async processCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    console.log(`Processing callback query from user ${userId}: ${data}`);

    // Получаем dbUserId для логирования
    const user = await this.postgresStorage.getUser(callbackQuery.from.id);
    if (!user) {
      console.error(`User ${callbackQuery.from.id} not found in database for logging`);
      return;
    }

    // Обрабатываем callback query через MessageService (логирование + ответ)
    if (user.id) {
      await this.messageService.handleCallbackQuery(callbackQuery, user.id);
    }

    // Получаем или создаем контекст пользователя  
    if (user.id) {
      await this.userContextManager.getOrCreateContext(userId, user.id);
    }
    
    // Универсальная обработка всех callback'ов через FlowEngine
    // Если пользователь нажал кнопку - значит он уже взаимодействует с ботом
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
      const existingUser = await this.postgresStorage.getUser(user.id);
      
      if (!existingUser) {
        // Пользователь будет зарегистрирован при команде /start
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

    // Очищаем команду от упоминания бота (@botname)
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
          await this.messageService.sendMessage(chatId, 'Доступные команды:\n/start - начать работу\n/help - помощь', dbUserId1);
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
          await this.messageService.sendMessage(chatId, 'Неизвестная команда. Используйте /help для списка команд.', dbUserId2);
        }
    }
  }

  private async handleStartCommandFlow(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;

    console.log(`🚀 Handling /start command via flow for user ${userId}`);

    // Получаем или создаем пользователя в базе для получения dbUserId
    let existingUser = await this.postgresStorage.getUser(userId);
    
    if (!existingUser) {
      // Создаем топик в админ группе для нового пользователя
      const topicId = await this.topicService.createTopicInAdminGroup(userId, message.from);
      
      // Регистрируем пользователя минимально для получения dbUserId
      const newUser = {
        telegramId: userId,
        firstName: message.from.first_name,
        lastName: message.from.last_name || '',
        username: message.from.username || '',
        registeredAt: new Date().toISOString(),
        topicId: topicId || 0
      };

      await this.postgresStorage.addUser(newUser);
      console.log(`✅ New user ${userId} registered for start flow`);
      
      // Обновляем ссылку на пользователя
      existingUser = await this.postgresStorage.getUser(userId);
    }

    if (!existingUser || !existingUser.id) {
      console.error(`Cannot start flow: user ${userId} registration failed`);
      return;
    }

    // Получаем или создаем контекст пользователя
    await this.userContextManager.getOrCreateContext(userId, existingUser.id);
    
    // Сохраняем информацию о текущем сообщении для использования в обработчиках
    await this.userContextManager.setVariable(userId, '_system.currentMessage', message);

    // Запускаем флоу регистрации
    await this.flowEngine.startFlow(userId, 'start_registration');

    console.log(`✅ Start flow launched for user ${userId}`);
  }

  private async handleMenuCommandFlow(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;

    console.log(`🚀 Handling /menu command via flow for user ${userId}`);
   
    // Запускаем флоу регистрации
    await this.flowEngine.startFlow(userId, 'menu');

    console.log(`✅ Menu flow launched for user ${userId}`);
  }

  // Метод для проверки отложенных сообщений (вызывается по cron)
  async checkDelayedMessages(): Promise<void> {
    try {
      console.log('Checking delayed messages...');
      
      // Получаем всех пользователей
      const users = await this.postgresStorage.getAllUsers();
      
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
      
      // Получаем данные пользователя
      const userData = user.data ? JSON.parse(user.data) : {};
      if (!userData.confirmation) {
        console.log(`No confirmation data for user ${user.telegramId}`);
        return;
      }
      
      console.log(`User ${user.telegramId} user data:`, JSON.stringify(userData, null, 2));
      
      // Проверяем, есть ли подтверждение подписок
      if (!userData.confirmation || !userData.confirmation.tg || !userData.confirmation.vk) {
        console.log(`No confirmation for user ${user.telegramId}`);
        return;
      }
      
      // Проверяем, прошёл ли час с подтверждения
      const dateTimeStr = userData.confirmation.date_time;
      console.log(`Checking confirmation time: ${dateTimeStr}`);
      
      // Парсим дату в UTC формате ISO
      const confirmationTime = new Date(dateTimeStr);
      
      if (isNaN(confirmationTime.getTime())) {
        console.log(`Invalid date format: ${dateTimeStr}`);
        return;
      }
      
      // Текущее время в UTC
      const now = new Date();
      
      // Вычисляем разность в миллисекундах
      const timeDiff = now.getTime() - confirmationTime.getTime();
      const oneHourInMs = 60 * 60 * 1000;
      
      console.log(`Confirmation time: ${confirmationTime.toISOString()}`);
      console.log(`Current time: ${now.toISOString()}`);
      console.log(`Time difference: ${timeDiff}ms (${Math.round(timeDiff / 1000 / 60)} minutes)`);
      console.log(`One hour in ms: ${oneHourInMs}`);
      
      if (timeDiff < oneHourInMs) {
        console.log(`Not yet an hour passed for user ${user.telegramId} (${Math.round(timeDiff / 1000 / 60)} minutes ago)`);
        return; // Ещё не прошёл час
      }
      
      // Проверяем, не отправляли ли уже сообщение
      if (userData.additional_messages && userData.additional_messages.some((msg: any) => msg.message_1)) {
        return; // Уже отправляли
      }
      
      // Отправляем сообщение
      await this.sendDelayedMessage(user.telegramId);
      
      // Обновляем данные пользователя
      const currentDateTime = new Date().toISOString();
      
      const additionalMessages = userData.additional_messages || [];
      additionalMessages.push({
        message_1: currentDateTime
      });
      
      userData.additional_messages = additionalMessages;
      await this.postgresStorage.updateUserData(user.telegramId, JSON.stringify(userData));
      console.log(`Delayed message sent to user ${user.telegramId}`);
      
    } catch (error) {
      console.error(`Error checking delayed message for user ${user.telegramId}:`, error);
    }
  }

  private async sendDelayedMessage(userId: number): Promise<void> {
    const message = `Кстати, а ты знаешь, что с MaikLoriss можно не только красиво выглядеть, но и здорово зарабатывать? 💰

✨ Хочешь покупать нашу косметику с ОГРОМНОЙ скидкой и получать кэшбек за каждую покупку?
✨ А может, тебе интересно делиться продукцией с друзьями и близкими и строить с нами свой бизнес?

Все возможности ждут тебя на нашем сайте! Переходи, изучай и присоединяйся к нашей дружной команде!`;

    const dbUserId = await this.getDbUserId(userId);
    if (dbUserId) {
      await this.messageService.sendMessage(userId, message, dbUserId);
    }
  }

  private async handleAllMessages(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;

    // Получаем информацию о пользователе
    const user = await this.postgresStorage.getUser(userId);
    
    if (!user) {
      console.log(`User ${userId} not found`);
      return;
    }
    
    // Проверяем, включена ли пересылка сообщений
    const forwardingEnabled = await this.userContextManager.isMessageForwardingEnabled(userId);
    
    if (forwardingEnabled && user.topicId) {
      // Пересылаем сообщение в топик пользователя только если пересылка включена
      await this.topicService.forwardMessageToUserTopic(userId, user.topicId, message);
      console.log(`📬 Message forwarded to topic for user ${userId}`);
    } else {
      console.log(`📪 Message forwarding disabled for user ${userId} - not forwarding to topic`);
    }
  }

  private async handleVKLink(userId: number, vkLink: string): Promise<void> {
    try {
      // Нормализуем ссылку VK
      let normalizedLink = vkLink.trim();
      if (normalizedLink.startsWith('@')) {
        normalizedLink = `https://vk.com/${normalizedLink.substring(1)}`;
      } else if (!normalizedLink.startsWith('http')) {
        normalizedLink = `https://vk.com/${normalizedLink}`;
      }

      // Сохраняем ссылку VK и сбрасываем состояние ожидания
      const user = await this.postgresStorage.getUser(userId);
      const userData = user?.data ? JSON.parse(user.data) : {};
      userData.vk = normalizedLink;
      delete userData.waitingForVK;
      await this.postgresStorage.updateUserData(userId, JSON.stringify(userData));
      
      console.log(`VK link saved for user ${userId}: ${normalizedLink}`);

      // Отправляем сообщение о проверке
      const dbUserId = await this.getDbUserId(userId);
      if (dbUserId) {
        await this.messageService.sendMessage(userId, "Вжух! 🔍 Проверяю...", dbUserId);
      }

      // Используем уже полученные данные пользователя для топика
      if (user && user.topicId) {
        const currentDateTime = new Date().toLocaleString('ru-RU', {
          timeZone: 'Europe/Moscow',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        const topicMessage = `Пользователь просит проверить подписки в группах

ID: ${userId}
Username: @${user.username || 'не указан'}
Имя: ${user.firstName || ''} ${user.lastName || ''}`.trim() + `
VK: ${normalizedLink}

Дата и время: ${currentDateTime}`;

        const adminChatId = parseInt(this.env.ADMIN_CHAT_ID);
        await this.messageService.sendMessageToTopic(adminChatId, user.topicId, topicMessage);
        
        console.log(`Check subscription request sent to topic ${user.topicId} for user ${userId}`);
      }

    } catch (error) {
      console.error(`Error handling VK link for user ${userId}:`, error);
    }
  }

  private async handleConfirmedCommand(message: TelegramMessage): Promise<void> {
    const userId = message.from.id;
    const chatId = message.chat.id;
    const adminChatId = parseInt(this.env.ADMIN_CHAT_ID);
    const topicId = (message as any).message_thread_id;

    console.log(`Handling /confirmed command from user ${userId} in topic ${topicId}`);

    // Проверяем, что команда выполняется в админ группе
    if (chatId !== adminChatId) {
      console.log(`/confirmed command ignored - not in admin group`);
      return;
    }

    // Проверяем, что команда выполняется в топике
    if (!topicId) {
      console.log(`/confirmed command ignored - not in topic`);
      return;
    }

    // Находим пользователя по topic_id
    const targetUserId = await this.postgresStorage.getUserIdByTopic(topicId);
    
    if (!targetUserId) {
      console.log(`No user found for topic ${topicId}`);
      return;
    }

    console.log(`Found user ${targetUserId} for topic ${topicId}`);

    // Получаем данные пользователя
    const user = await this.postgresStorage.getUser(targetUserId);
    
    if (user) {
      // Добавляем подтверждение подписок с временем в UTC
      const currentDateTime = new Date().toISOString();

      // Обновляем данные пользователя
      const targetUser = await this.postgresStorage.getUser(targetUserId);
      const targetUserData = targetUser?.data ? JSON.parse(targetUser.data) : {};
      targetUserData.confirmation = {
        tg: true,
        vk: true,
        date_time: currentDateTime
      };
      await this.postgresStorage.updateUserData(targetUserId, JSON.stringify(targetUserData));
      
      console.log(`User ${targetUserId} session updated with confirmation`);
    }

    // Отправляем сообщение пользователю
    const messageText = `Да! Ты наш человек! Всё верно, подписки есть! 
Теперь ты участвуешь в розыгрыше! 

Результаты объявим в наших соцсетях — следи за новостями и лови удачу! 🍀`;

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

    // Проверяем, что команда выполняется в админ группе
    if (chatId !== adminChatId) {
      console.log(`/not_confirmed command ignored - not in admin group`);
      return;
    }

    // Проверяем, что команда выполняется в топике
    if (!topicId) {
      console.log(`/not_confirmed command ignored - not in topic`);
      return;
    }

    // Находим пользователя по topic_id
    const targetUserId = await this.postgresStorage.getUserIdByTopic(topicId);
    
    if (!targetUserId) {
      console.log(`No user found for topic ${topicId}`);
      return;
    }

    console.log(`Found user ${targetUserId} for topic ${topicId}`);

    // Отправляем сообщение пользователю
    const messageText = `Так-так... Что-то не сходится! 😕

Я не вижу твоей подписки в одном из наших сообществ (или в обоих). 

Вернись, уверься, что подписался(ась) на оба ресурса, и жми на кнопку «✨ Готово! Проверяй!» снова! Ждем тебя!`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "👉 Наш Telegram",
            url: "https://t.me/ml_cosmetic"
          }
        ],
        [
          {
            text: "👉 Наша группа ВК",
            url: "https://vk.com/public48764292"
          }
        ],
        [
          {
            text: "✨Готово! Проверяй!",
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
