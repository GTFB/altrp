import { D1StorageService } from '../worker/d1-storage-service';
import type { TelegramMessage, TelegramCallbackQuery } from '../worker/bot';
import { getMessageType } from '../helpers/getMessageType';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';
import { HumanRepository } from '../repositories/HumanRepository';
import { MessageRepository } from '../repositories/MessageRepository';

export interface MessageLoggingServiceConfig {
  d1Storage: D1StorageService;
  humanRepository: HumanRepository;
  messageRepository: MessageRepository;
}

/**
 * Service for logging messages and callback queries
 * Responsible only for logging, not for sending messages
 */
export class MessageLoggingService {
  private d1Storage: D1StorageService;
  private humanRepository: HumanRepository;
  private messageRepository: MessageRepository;

  constructor(config: MessageLoggingServiceConfig) {
    this.d1Storage = config.d1Storage;
    this.humanRepository = config.humanRepository;
    this.messageRepository = config.messageRepository;
  }

  /**
   * Logs message (incoming or outgoing)
   * Handles all message types: text, voice, photo, document
   */
  async logMessage(message: TelegramMessage, direction: 'incoming' | 'outgoing', dbUserId: number): Promise<void> {
    try {
      const userId = direction === 'incoming' ? message.from.id : message.chat.id;
      console.log(`📝 Logging ${direction} message ${direction === 'incoming' ? 'from' : 'to'} user ${userId} (DB ID: ${dbUserId})`);
      
      // Determine message type based on direction
      const messageType = getMessageType(message, direction);
      
      // Extract content based on message type
      let content = message.text || message.caption || '';
      if (message.voice) {
        content = `Voice message (${message.voice.duration}s)`;
      } else if (message.photo && message.photo.length > 0) {
        content = message.caption || 'Photo';
      } else if (message.document) {
        content = message.caption || `Document: ${message.document.file_name || 'Unknown'}`;
      }
      
      const messageLog = {
        userId: dbUserId, // Use ID from users table, not Telegram ID
        messageType,
        direction,
        content,
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
   * Log message from user to topic
   */
  // async logMessageToTopic(userId: number, topicId: number, message: TelegramMessage): Promise<void> {
  //   try {
  //     // Get human to get haid and id
  //     const human = await this.humanRepository.getHumanByTelegramId(userId);
  //     if (!human || !human.id || !human.haid) {
  //       console.warn(`Human ${userId} not found or has no haid, skipping message logging`);
  //       return;
  //     }

  //     const uuid = generateUuidV4();
  //     const fullMaid = generateAid('m');
  //     const maid = human.haid;

  //     // Prepare title (content) and data_in
  //     const title = message.text || message.caption || '';
  //     const dataIn = JSON.stringify({
  //       humanId: human.id,
  //       telegramId: userId,
  //       messageType: getMessageType(message),
  //       direction: 'incoming',
  //       telegramMessageId: message.message_id,
  //       fileId: message.voice?.file_id || message.photo?.[0]?.file_id || message.document?.file_id,
  //       fileName: message.document?.file_name,
  //       caption: message.caption,
  //       topicId: topicId,
  //       createdAt: new Date().toISOString()
  //     });

  //     await this.d1Storage.execute(`
  //       INSERT INTO messages (uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in)
  //       VALUES (?, ?, ?, ?, 'active', 0, ?, '', ?)
  //     `, [uuid, maid, fullMaid, title, maid, dataIn]);

  //     console.log(`✅ Message logged to topic: ${fullMaid} (linked to human ${maid})`);
  //   } catch (error) {
  //     console.error('❌ Error logging message to topic:', error);
  //   }
  // }

}

