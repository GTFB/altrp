import { MessageService } from './message-service';
import type { TelegramMessage, TelegramUser } from '../worker/bot';

export interface TopicServiceConfig {
  botToken: string;
  adminChatId: number;
  messageService: MessageService;
}

export class TopicService {
  private botToken: string;
  private adminChatId: number;
  private messageService: MessageService;

  constructor(config: TopicServiceConfig) {
    this.botToken = config.botToken;
    this.adminChatId = config.adminChatId;
    this.messageService = config.messageService;
  }

  /**
   * Создает топик в админской группе для нового пользователя
   */
  async createTopicInAdminGroup(userId: number, user: TelegramUser): Promise<number | null> {
    try {
      const topicName = `${user.first_name} ${user.last_name || ''}`.trim();
      
      console.log(`Creating topic "${topicName}" in admin group ${this.adminChatId}`);

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/createForumTopic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.adminChatId,
          name: topicName,
          icon_color: 0x6FB9F0, // Синий цвет иконки
          icon_custom_emoji_id: undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error creating topic:', errorData);
        return null;
      }

      const result = await response.json();
      const topicId = (result as any).result?.message_thread_id;
      
      if (topicId) {
        console.log(`Topic created successfully with ID: ${topicId}`);
        
        // Отправляем приветственное сообщение в топик
        await this.messageService.sendMessageToTopic(this.adminChatId, topicId, 
          `👋 Новый пользователь!\n\n` +
          `Имя: ${user.first_name} ${user.last_name || ''}\n` +
          `Username: @${user.username || 'не указан'}\n` +
          `ID: ${userId}\n\n`
        );
        
        return topicId;
      } else {
        console.error('No topic ID in response:', result);
        return null;
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      return null;
    }
  }

  /**
   * Пересылает сообщение пользователю из топика админской группы
   */
  async forwardMessageToUser(userId: number, message: TelegramMessage, getDbUserId: (telegramId: number) => Promise<number | null>): Promise<void> {
    try {
      const dbUserId = await getDbUserId(userId);
      if (!dbUserId) {
        console.error(`Cannot forward message: user ${userId} not found in database`);
        return;
      }

      if (message.text) {
        // Пересылаем текстовое сообщение
        await this.messageService.sendMessage(userId, message.text, dbUserId);
      } else if (message.voice) {
        // Пересылаем голосовое сообщение
        await this.messageService.sendVoiceToUser(userId, message.voice.file_id, message.voice.duration, dbUserId);
      } else if (message.photo && message.photo.length > 0) {
        // Пересылаем фото
        const photoFileId = message.photo?.[message.photo.length - 1]?.file_id;
        await this.messageService.sendPhotoToUser(userId, photoFileId || '', message.caption, dbUserId);
      } else if (message.document) {
        // Пересылаем документ
        await this.messageService.sendDocumentToUser(userId, message.document.file_id, message.document.file_name, message.caption, dbUserId);
      } 
    } catch (error) {
      console.error('Error forwarding message to user:', error);
    }
  }

  /**
   * Пересылает сообщение пользователя в его топик в админской группе
   */
  async forwardMessageToUserTopic(userId: number, topicId: number, message: TelegramMessage): Promise<void> {
    try {
      // Определяем тип сообщения и создаем соответствующее описание
      let messageDescription = '';
      let fileId = '';
      
      if (message.text) {
        messageDescription = `📝 Текст: ${message.text}`;
      } else if (message.voice) {
        messageDescription = `🎤 Голосовое сообщение (${message.voice.duration}с)`;
        fileId = message.voice.file_id;
      } else if (message.photo && message.photo.length > 0) {
        messageDescription = `📷 Фото`;
        fileId = message.photo?.[message.photo.length - 1]?.file_id || ''; // Берем самое большое фото
      } else if (message.document) {
        messageDescription = `📄 Документ: ${message.document.file_name || 'Без названия'}`;
        fileId = message.document.file_id;
      } else {
        messageDescription = `📎 Медиафайл`;
      }

      // Отправляем описание сообщения в топик
      const topicMessage = `👤 ${message.from.first_name} ${message.from.last_name || ''} (ID: ${userId})\n\n${messageDescription}`;
      
      await this.messageService.sendMessageToTopic(this.adminChatId, topicId, topicMessage);

      // Если есть файл, пересылаем его
      if (fileId) {
        await this.forwardFileToTopic(topicId, fileId, message);
      }

    } catch (error) {
      console.error('Error forwarding message to user topic:', error);
    }
  }

  /**
   * Пересылает файл в топик админской группы
   */
  async forwardFileToTopic(topicId: number, fileId: string, message: TelegramMessage): Promise<void> {
    try {
      let method = '';
      let body: any = {
        chat_id: this.adminChatId,
        message_thread_id: topicId,
        from_chat_id: message.chat.id,
        message_id: message.message_id
      };

      // Определяем метод в зависимости от типа файла
      if (message.voice) {
        method = 'sendVoice';
        body = {
          chat_id: this.adminChatId,
          message_thread_id: topicId,
          voice: fileId
        };
      } else if (message.photo) {
        method = 'sendPhoto';
        body = {
          chat_id: this.adminChatId,
          message_thread_id: topicId,
          photo: fileId
        };
      } else if (message.document) {
        method = 'sendDocument';
        body = {
          chat_id: this.adminChatId,
          message_thread_id: topicId,
          document: fileId
        };
      } else {
        // Используем общий метод пересылки
        method = 'forwardMessage';
        body = {
          chat_id: this.adminChatId,
          message_thread_id: topicId,
          from_chat_id: message.chat.id,
          message_id: message.message_id
        };
      }

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/${method}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error forwarding file to topic:', errorData);
      } else {
        console.log('File forwarded to topic successfully');
      }
    } catch (error) {
      console.error('Error forwarding file to topic:', error);
    }
  }

  /**
   * Обрабатывает сообщение из топика админской группы
   */
  async handleMessageFromTopic(message: TelegramMessage, getUserIdByTopic: (topicId: number) => Promise<number | null>, getDbUserId: (telegramId: number) => Promise<number | null>): Promise<void> {
    const topicId = (message as any).message_thread_id;
    
    console.log(`Processing message from topic ${topicId}`);

    // Находим пользователя по topic_id
    const userId = await getUserIdByTopic(topicId!);
    
    if (userId) {
      console.log(`Found user ${userId} for topic ${topicId}`);
      
      // Проверяем, если это команда (начинается с '/'), то не пересылаем
      if (message.text && message.text.startsWith('/')) {
        console.log(`Command message from topic ignored: ${message.text}`);
        return;
      }
      
      // Пересылаем сообщение пользователю
      await this.forwardMessageToUser(userId, message, getDbUserId);
      
      // Сообщение уже логируется в соответствующих методах sendMessage/sendVoice/sendPhoto/sendDocument
    } else {
      console.log(`No user found for topic ${topicId}`);
    }
  }
}
