import type { D1Database } from '@cloudflare/workers-types';
import type { PostgresD1Adapter } from '../nodejs/postgres-d1-adapter';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';
import { HumanRepository } from './HumanRepository';
import { MessageThreadRepository } from './MessageThreadRepository';

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
  statusName?: string; // Status name: 'flow_mode', 'text', 'voice', 'photo', 'document'
  createdAt?: string;
}

export interface MessageConfig {
  db: D1Database | PostgresD1Adapter;
  humanRepository: HumanRepository;
  messageThreadRepository: MessageThreadRepository;
  botType?: string; // Bot type: 'leadsgen', 'matcher', etc.
}

/**
 * Repository for working with messages table
 * Uses D1Database API (or PostgresD1Adapter which mimics it)
 */
export class MessageRepository {
  private db: D1Database | PostgresD1Adapter;
  private humanRepository: HumanRepository;
  private messageThreadRepository: MessageThreadRepository;
  private botType: string;

  constructor(config: MessageConfig) {
    this.db = config.db;
    this.humanRepository = config.humanRepository;
    this.messageThreadRepository = config.messageThreadRepository;
    this.botType = config.botType || 'leadsgen';
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

      // Get human to get haid and topic_id
      const human = await this.humanRepository.getHumanById(message.humanId);
      if (!human || !human.haid) {
        throw new Error(`Human with id ${message.humanId} not found or has no haid`);
      }

      const uuid = generateUuidV4();
      const fullMaid = generateAid('m');
      
      // Try to get maid from topic (message_threads)
      let maid: string | null = null;
      
      // Extract topic_id from human.dataIn
      if (human.dataIn) {
        try {
          const dataInObj = JSON.parse(human.dataIn);
          const topicId = dataInObj.topic_id;
          
          if (topicId) {
            // Find message thread by value (topic_id)
            const messageThread = await this.messageThreadRepository.getMessageThreadByValue(
              topicId.toString(),
              'leadsgen'
            );
            
            if (messageThread && messageThread.maid) {
              maid = messageThread.maid;
              console.log(`✅ Found topic maid ${maid} for topic_id ${topicId}`);
            } else {
              console.log(`⚠️ Topic not found for topic_id ${topicId}, leaving maid empty`);
            }
          } else {
            console.log(`⚠️ No topic_id in human.dataIn, leaving maid empty`);
          }
        } catch (e) {
          console.warn(`Failed to parse human.dataIn for human ${message.humanId}, leaving maid empty:`, e);
        }
      } else {
        console.log(`⚠️ No dataIn for human ${message.humanId}, leaving maid empty`);
      }

      // Prepare title (content) and data_in
      const title = message.content || '';
      const statusName = message.statusName || 'active'; // Use provided status_name or default to 'active'
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
          uuid, maid, full_maid, title, status_name, "order", gin, fts, data_in, xaid
        ) VALUES (?, ?, ?, ?, ?, 0, ?, '', ?, ?)
      `;
      
      const params = [
        uuid,
        maid || null, // Use topic maid if found, otherwise null
        fullMaid,
        title,
        statusName,
        null, // gin - not used, leave empty
        dataIn,
        human.haid // Use human.haid for xaid
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

  /**
   * Get recent messages by maid, xaid and status_name
   * Returns messages ordered by created_at DESC with optional limit
   * If limit is not provided, returns all matching messages
   */
  async getRecentMessages(
    maid: string, 
    xaid: string, 
    statusName: string = 'text', 
    limit?: number
  ): Promise<Array<{ title: string; created_at: string; data_in: string }>> {
    try {
      let query = `
        SELECT title, created_at, data_in 
        FROM messages 
        WHERE status_name = ? AND maid = ? AND xaid = ?
        ORDER BY created_at DESC
      `;
      
      const params: any[] = [statusName, maid, xaid];
      
      if (limit !== undefined) {
        query += ` LIMIT ?`;
        params.push(limit);
      }
      
      const result = await this.db.prepare(query).bind(...params).all();

      if (!result.success || !result.results) {
        return [];
      }

      return result.results.map((row: any) => ({
        title: row.title as string || '',
        created_at: row.created_at as string || '',
        data_in: row.data_in as string || ''
      }));
    } catch (error) {
      console.error(`❌ Error getting recent messages:`, error);
      return [];
    }
  }

  /**
   * Get all messages by maid, xaid and status_name
   * Returns messages ordered by created_at ASC (for summary generation)
   * Includes uuid and full_maid fields needed for summary tracking
   */
  async getAllMessagesByMaid(
    maid: string,
    xaid: string,
    statusName: string = 'text'
  ): Promise<Array<{ uuid: string; full_maid: string; title: string; data_in: string; created_at: string }>> {
    try {
      const result = await this.db.prepare(`
        SELECT uuid, full_maid, title, data_in, created_at
        FROM messages
        WHERE status_name = ? AND maid = ? AND xaid = ?
        ORDER BY created_at ASC
      `).bind(statusName, maid, xaid).all();

      if (!result.success || !result.results) {
        return [];
      }

      return result.results.map((row: any) => ({
        uuid: row.uuid as string || '',
        full_maid: row.full_maid as string || '',
        title: row.title as string || '',
        data_in: row.data_in as string || '',
        created_at: row.created_at as string || ''
      }));
    } catch (error) {
      console.error(`❌ Error getting all messages by maid:`, error);
      return [];
    }
  }
}

