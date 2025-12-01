import { MessageService } from './message-service';
import { MessageLoggingService } from './message-logging-service';
import type { TelegramMessage, TelegramUser } from '../worker/bot';

export interface TopicServiceConfig {
  botToken: string;
  adminChatId?: number;
  messageService: MessageService;
  messageLoggingService: MessageLoggingService;
}

export class TopicService {
  private botToken: string;
  private adminChatId?: number;
  private messageService: MessageService;
  private messageLoggingService: MessageLoggingService;

  constructor(config: TopicServiceConfig) {
    this.botToken = config.botToken;
    this.adminChatId = config.adminChatId;
    this.messageService = config.messageService;
    this.messageLoggingService = config.messageLoggingService;
  }

  private resolveChatId(chatId?: number): number | null {
    const resolved = typeof chatId === 'number' && !Number.isNaN(chatId)
      ? chatId
      : typeof this.adminChatId === 'number' && !Number.isNaN(this.adminChatId)
        ? this.adminChatId
        : null;

    if (resolved === null) {
      console.error('Admin chat ID is not configured');
    }

    return resolved;
  }


  /**
   * Creates topic in admin group with specified name
   */
  async createTopic(topicName: string, iconColor: number = 0x6FB9F0, chatId?: number): Promise<number | null> {
    try {
      const targetChatId = this.resolveChatId(chatId);
      if (!targetChatId) {
        return null;
      }

      console.log(`Creating topic "${topicName}" in admin group ${targetChatId}`);

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/createForumTopic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: targetChatId,
          name: topicName,
          icon_color: iconColor,
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
        console.log(`Topic "${topicName}" created successfully with ID: ${topicId}`);
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
   * Edits topic icon
   */
  async editTopicIcon(topicId: number, iconCustomEmojiId: string | null, iconColor?: number, chatId?: number): Promise<boolean> {
    try {
      const targetChatId = this.resolveChatId(chatId);
      if (!targetChatId) {
        return false;
      }

      const body: any = {
        chat_id: targetChatId,
        message_thread_id: topicId
      };

      if (iconCustomEmojiId !== null) {
        body.icon_custom_emoji_id = iconCustomEmojiId;
      } else {
        body.icon_custom_emoji_id = null;
        if (iconColor !== undefined) {
          body.icon_color = iconColor;
        }
      }

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/editForumTopic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error editing topic icon:', errorData);
        return false;
      }

      console.log(`✅ Topic icon updated for topic ${topicId}`);
      return true;
    } catch (error) {
      console.error('Error editing topic icon:', error);
      return false;
    }
  }

  /**
   * Forwards message to user from admin group topic
   */
  async forwardMessageToUser(userId: number, message: TelegramMessage, getDbUserId: (telegramId: number) => Promise<number | null>): Promise<void> {
    try {
      const dbHumanId = await getDbUserId(userId);
      if (!dbHumanId) {
        console.error(`Cannot forward message: user ${userId} not found in database`);
        return;
      }

      const topicId = (message as any).message_thread_id;

      if (message.text) {
        // Forward text message
        await this.messageService.sendMessage(userId, message.text, dbHumanId);
      } else if (message.voice) {
        // Forward voice message
        await this.messageService.sendVoiceToUser(userId, message.voice.file_id, message.voice.duration, dbHumanId);
      } else if (message.photo && message.photo.length > 0) {
        // Forward photo
        const photoFileId = message.photo?.[message.photo.length - 1]?.file_id;
        await this.messageService.sendPhotoToUser(userId, photoFileId || '', message.caption, dbHumanId);
      } else if (message.document) {
        // Forward document
        await this.messageService.sendDocumentToUser(userId, message.document.file_id, message.document.file_name, message.caption, dbHumanId);
      }

      // Message is already logged in corresponding methods sendMessage/sendVoice/sendPhoto/sendDocument
    } catch (error) {
      console.error('Error forwarding message to user:', error);
    }
  }

  /**
   * Forwards user message to their topic in admin group
   */
  async forwardMessageToUserTopic(userId: number, topicId: number, message: TelegramMessage, chatId?: number): Promise<void> {
    try {
      const targetChatId = this.resolveChatId(chatId);
      if (!targetChatId) {
        return;
      }

      // Determine message type and create appropriate description
      let messageDescription = '';
      let fileId = '';
      
      if (message.text) {
        //messageDescription = `📝 <b>Text:</b> ${message.text}`;
        messageDescription = `${message.text}`;
      } else if (message.voice) {
        messageDescription = `🎤 <b>Voice message:</b> (${message.voice.duration}s)`;
        fileId = message.voice.file_id;
      } else if (message.photo && message.photo.length > 0) {
        messageDescription = `📷 <b>Photo</b>`;
        fileId = message.photo?.[message.photo.length - 1]?.file_id || ''; // Take largest photo
      } else if (message.document) {
        messageDescription = `📄 <b>Document</b>: ${message.document.file_name || 'No name'}`;
        fileId = message.document.file_id;
      } else {
        messageDescription = `📎 <b>Media file</b>`;
      }

      // Send message description to topic
      //const topicMessage = `<b>👤 ${message.from.first_name} ${message.from.last_name || ''}</b> (ID: ${userId})\n\n${messageDescription}`;
      const topicMessage = `<b>👤 ${message.from.first_name} ${message.from.last_name || ''}</b>\n\n${messageDescription}`;
      
      await this.messageService.sendMessageToTopic(targetChatId, topicId, topicMessage);

      // If there is a file, forward it
      if (fileId) {
        await this.forwardFileToTopic(topicId, fileId, message, targetChatId);
      }

    } catch (error) {
      console.error('Error forwarding message to user topic:', error);
    }
  }

  /**
   * Forwards file to admin group topic
   */
  async forwardFileToTopic(topicId: number, fileId: string, message: TelegramMessage, chatId?: number): Promise<void> {
    try {
      const targetChatId = this.resolveChatId(chatId);
      if (!targetChatId) {
        return;
      }

      let method = '';
      let body: any = {
        chat_id: targetChatId,
        message_thread_id: topicId,
        from_chat_id: message.chat.id,
        message_id: message.message_id
      };

      // Determine method based on file type
      if (message.voice) {
        method = 'sendVoice';
        body = {
          chat_id: targetChatId,
          message_thread_id: topicId,
          voice: fileId
        };
      } else if (message.photo) {
        method = 'sendPhoto';
        body = {
          chat_id: targetChatId,
          message_thread_id: topicId,
          photo: fileId
        };
      } else if (message.document) {
        method = 'sendDocument';
        body = {
          chat_id: targetChatId,
          message_thread_id: topicId,
          document: fileId
        };
      } else {
        // Use general forwarding method
        method = 'forwardMessage';
        body = {
          chat_id: targetChatId,
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
   * Processes message from admin group topic
   */
  async handleMessageFromTopic(message: TelegramMessage, getUserIdByTopic: (topicId: number) => Promise<number | null>, getDbUserId: (telegramId: number) => Promise<number | null>): Promise<void> {
    const topicId = (message as any).message_thread_id;
    
    console.log(`Processing message from topic ${topicId}`);

    // Find user by topic_id
    const userId = await getUserIdByTopic(topicId!);
    
    if (userId) {
      console.log(`Found user ${userId} for topic ${topicId}`);
      
      // Check if this is a command (starts with '/'), then don't forward
      if (message.text && message.text.startsWith('/')) {
        console.log(`Command message from topic ignored: ${message.text}`);
        return;
      }
      
      // Forward message to user
      await this.forwardMessageToUser(userId, message, getDbUserId);
      
      // Message is already logged in corresponding methods sendMessage/sendVoice/sendPhoto/sendDocument
    } else {
      console.log(`No user found for topic ${topicId}`);
    }
  }
}
