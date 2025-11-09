import type { D1Database } from '@cloudflare/workers-types';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';
import { HumanRepository } from './HumanRepository';

export interface MessageData {
  id?: number;
  humanId: number; // DB human ID (humans.id) - auto-increment human ID
  messageType: 'user_text' | 'user_voice' | 'user_photo' | 'user_document' | 'user_callback' | 'bot_text' | 'bot_photo' | 'bot_voice' | 'bot_document' | 'command';
  direction: 'incoming' | 'outgoing';
  content?: string;
  telegramMessageId?: number;
  callbackData?: string;
  commandName?: string;
  fileId?: string;
  fileName?: string;
  caption?: string;
  topicId?: number;
  data?: string; // JSON string for additional data
  createdAt?: string;
}

export interface MessageConfig {
  db: D1Database;
  humanRepository: HumanRepository;
}

/**
 * Repository for working with messages table
 */
export class MessageRepository {
  private db: D1Database;
  private humanRepository: HumanRepository;

  constructor(config: MessageConfig) {
    this.db = config.db;
    this.humanRepository = config.humanRepository;
  }

  /**
   * Add message to database
   */
  async addMessage(message: MessageData): Promise<number> {
    console.log(`💾 D1: Adding message for human ${message.humanId}, type: ${message.messageType}, direction: ${message.direction}`);
    console.log(`💾 D1: Message content: ${message.content?.substring(0, 100)}...`);

    try {
      // Check database connection
      if (!this.db) {
        throw new Error('D1 database connection is not initialized');
      }

      // Get human to get haid for maid field
      const human = await this.humanRepository.getHumanById(message.humanId);
      if (!human || !human.haid) {
        throw new Error(`Human with id ${message.humanId} not found or has no haid`);
      }

      const uuid = generateUuidV4();
      const fullMaid = generateAid('m');
      const maid = human.haid; // Use human's haid as maid to link messages

      // Prepare title (content) and data_in
      const title = message.content || '';
      const dataIn = JSON.stringify({
        //userId: message.userId,
        messageType: message.messageType,
        direction: message.direction,
        telegramMessageId: message.telegramMessageId,
        callbackData: message.callbackData,
        commandName: message.commandName,
        fileId: message.fileId,
        fileName: message.fileName,
        caption: message.caption,
        topicId: message.topicId,
        data: message.data,
        createdAt: message.createdAt || new Date().toISOString()
      });

      console.log(`💾 D1: Preparing SQL statement with new structure...`);
      
      const query = `
        INSERT INTO messages (
          uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in
        ) VALUES (?, ?, ?, ?, 'active', 0, ?, '', ?)
      `;
      
      const params = [
        uuid,
        maid,
        fullMaid,
        title,
        maid, // Use maid for grouping (gin)
        dataIn
      ];

      console.log(`💾 D1: Executing query with params:`, params);
      
      const result = await this.db.prepare(query).bind(...params).run();

      console.log(`💾 D1: Query result:`, JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log(`✅ D1: Message added successfully with ID: ${result.meta.last_row_id}`);
        return result.meta.last_row_id as number;
      } else {
        throw new Error(`D1 query failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ D1: Error adding message:`, error);
      console.error(`❌ D1: Error details:`, JSON.stringify(error, null, 2));
      throw error;
    }
  }
}

