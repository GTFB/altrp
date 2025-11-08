import { D1StorageService } from '../worker/d1-storage-service';
import type { TelegramMessage, TelegramCallbackQuery } from '../worker/bot';
import { getMessageType } from '../helpers/getMessageType';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';
import { HumanRepository } from '../repositories/HumanRepository';
import { MessageRepository } from '../repositories/MessageRepository';

export interface MessageLoggingServiceConfig {
  d1Storage: D1StorageService;
  humanModel: HumanRepository;
  messageRepository: MessageRepository;
}

/**
 * Service for logging messages and callback queries
 * Responsible only for logging, not for sending messages
 */
export class MessageLoggingService {
  private d1Storage: D1StorageService;
  private humanModel: HumanRepository;
  private messageRepository: MessageRepository;

  constructor(config: MessageLoggingServiceConfig) {
    this.d1Storage = config.d1Storage;
    this.humanModel = config.humanModel;
    this.messageRepository = config.messageRepository;
  }

  /**
   * Logs incoming message from user
   */
  async logMessage(message: TelegramMessage, direction: 'incoming' | 'outgoing', dbUserId: number): Promise<void> {
    try {
      console.log(`📝 Logging ${direction} message from user ${message.from.id} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: getMessageType(message),
        direction,
        content: message.text || '',
        telegramMessageId: message.message_id,
        fileId: message.voice?.file_id || message.photo?.[0]?.file_id || message.document?.file_id || '',
        fileName: message.document?.file_name || '',
        caption: message.caption || '',
        createdAt: new Date().toISOString()
      };

      console.log(`📝 Message log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.messageRepository.addMessage(messageLog);
      console.log(`✅ Message logged successfully with ID: ${result}`);
    } catch (error) {
      console.error('❌ Error logging message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs callback query
   */
  async logCallbackQuery(callbackQuery: TelegramCallbackQuery, dbUserId: number): Promise<void> {
    try {
      console.log(`🔘 Logging callback query from user ${callbackQuery.from.id} (DB ID: ${dbUserId}): ${callbackQuery.data}`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'user_callback' as const,
        direction: 'incoming' as const,
        content: callbackQuery.data || '',
        telegramMessageId: callbackQuery.message?.message_id || 0,
        callbackData: callbackQuery.data || '',
        createdAt: new Date().toISOString()
      };

      console.log(`🔘 Callback log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.messageRepository.addMessage(messageLog);
      console.log(`✅ Callback logged successfully with ID: ${result}`);
    } catch (error) {
      console.error('❌ Error logging callback query:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs sent text message
   */
  async logSentMessage(chatId: number, text: string, messageId: number, dbUserId: number): Promise<void> {
    try {
      console.log(`🤖 Logging bot message to user ${chatId} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'bot_text' as const,
        direction: 'outgoing' as const,
        content: text,
        telegramMessageId: messageId,
        createdAt: new Date().toISOString()
      };

      console.log(`🤖 Bot message log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.messageRepository.addMessage(messageLog);
      console.log(`✅ Bot message logged successfully with ID: ${result} for user ${chatId}: ${text.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ Error logging sent message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs sent voice message
   */
  async logSentVoiceMessage(userId: number, fileId: string, messageId: number, duration: number, dbUserId: number): Promise<void> {
    try {
      console.log(`🎤 Logging bot voice message to user ${userId} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'bot_voice' as const,
        direction: 'outgoing' as const,
        content: `Voice message (${duration}s)`,
        telegramMessageId: messageId,
        fileId: fileId,
        createdAt: new Date().toISOString()
      };

      console.log(`🎤 Bot voice log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.messageRepository.addMessage(messageLog);
      console.log(`✅ Bot voice message logged successfully with ID: ${result} for user ${userId}`);
    } catch (error) {
      console.error('❌ Error logging sent voice message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs sent photo
   */
  async logSentPhotoMessage(userId: number, fileId: string, messageId: number, caption: string | undefined, dbUserId: number): Promise<void> {
    try {
      console.log(`📷 Logging bot photo message to user ${userId} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'bot_photo' as const,
        direction: 'outgoing' as const,
        content: caption || 'Photo',
        telegramMessageId: messageId,
        fileId: fileId,
        caption: caption || '',
        createdAt: new Date().toISOString()
      };

      console.log(`📷 Bot photo log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.messageRepository.addMessage(messageLog);
      console.log(`✅ Bot photo message logged successfully with ID: ${result} for user ${userId}`);
    } catch (error) {
      console.error('❌ Error logging sent photo message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Logs sent document
   */
  async logSentDocumentMessage(userId: number, fileId: string, messageId: number, fileName: string | undefined, caption: string | undefined, dbUserId: number): Promise<void> {
    try {
      console.log(`📄 Logging bot document message to user ${userId} (DB ID: ${dbUserId})`);
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType: 'bot_document' as const,
        direction: 'outgoing' as const,
        content: caption || `Document: ${fileName || 'Unknown'}`,
        telegramMessageId: messageId,
        fileId: fileId,
        fileName: fileName || '',
        caption: caption || '',
        createdAt: new Date().toISOString()
      };

      console.log(`📄 Bot document log object:`, JSON.stringify(messageLog, null, 2));
      
      const result = await this.messageRepository.addMessage(messageLog);
      console.log(`✅ Bot document message logged successfully with ID: ${result} for user ${userId}`);
    } catch (error) {
      console.error('❌ Error logging sent document message:', error);
      console.error('Error details:', error);
    }
  }

  /**
   * Log message from user to topic
   */
  async logMessageToTopic(userId: number, topicId: number, message: TelegramMessage): Promise<void> {
    try {
      // Get human to get haid and id
      const human = await this.humanModel.getHumanByTelegramId(userId);
      if (!human || !human.id || !human.haid) {
        console.warn(`Human ${userId} not found or has no haid, skipping message logging`);
        return;
      }

      const uuid = generateUuidV4();
      const fullMaid = generateAid('m');
      const maid = human.haid;

      // Prepare title (content) and data_in
      const title = message.text || message.caption || '';
      const dataIn = JSON.stringify({
        humanId: human.id,
        telegramId: userId,
        messageType: getMessageType(message),
        direction: 'incoming',
        telegramMessageId: message.message_id,
        fileId: message.voice?.file_id || message.photo?.[0]?.file_id || message.document?.file_id,
        fileName: message.document?.file_name,
        caption: message.caption,
        topicId: topicId,
        createdAt: new Date().toISOString()
      });

      await this.d1Storage.execute(`
        INSERT INTO messages (uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in)
        VALUES (?, ?, ?, ?, 'active', 0, ?, '', ?)
      `, [uuid, maid, fullMaid, title, maid, dataIn]);

      console.log(`✅ Message logged to topic: ${fullMaid} (linked to human ${maid})`);
    } catch (error) {
      console.error('❌ Error logging message to topic:', error);
    }
  }

  /**
   * Log message from topic to user
   */
  async logMessageFromTopic(userId: number, topicId: number, message: TelegramMessage): Promise<void> {
    try {
      // Get human to get haid and id
      const human = await this.humanModel.getHumanByTelegramId(userId);
      if (!human || !human.id || !human.haid) {
        console.warn(`Human ${userId} not found or has no haid, skipping message logging`);
        return;
      }

      const uuid = generateUuidV4();
      const fullMaid = generateAid('m');
      const maid = human.haid;

      // Prepare title (content) and data_in
      const title = message.text || message.caption || '';
      const dataIn = JSON.stringify({
        humanId: human.id,
        telegramId: userId,
        messageType: getMessageType(message),
        direction: 'outgoing',
        telegramMessageId: message.message_id,
        fileId: message.voice?.file_id || message.photo?.[0]?.file_id || message.document?.file_id,
        fileName: message.document?.file_name,
        caption: message.caption,
        topicId: topicId,
        createdAt: new Date().toISOString()
      });

      await this.d1Storage.execute(`
        INSERT INTO messages (uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in)
        VALUES (?, ?, ?, ?, 'active', 0, ?, '', ?)
      `, [uuid, maid, fullMaid, title, maid, dataIn]);

      console.log(`✅ Message logged from topic: ${fullMaid} (linked to human ${maid})`);
    } catch (error) {
      console.error('❌ Error logging message from topic:', error);
    }
  }
}

