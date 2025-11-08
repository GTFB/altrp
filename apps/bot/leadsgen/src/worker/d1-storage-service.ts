import { D1Database } from '@cloudflare/workers-types';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';
import { Human } from '../models/Human';

export interface User {
  id?: number; // Auto-increment ID from users table
  telegramId: number; // Telegram user ID
  firstName?: string;
  lastName?: string;
  username?: string;
  registeredAt: string;
  topicId?: number;
  language?: string; // User language
  data?: string; // JSON string for additional data
}

export interface Registration {
  id?: number;
  userId: number;
  groupId: string;
  parentName: string;
  childName: string;
  childAge: number;
  phone: string;
  additionalCourses?: string;
  status: string;
  createdAt?: string;
}

export interface Message {
  id?: number;
  userId: number; // DB user ID (users.id) - auto-increment user ID
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

// Human interface moved to src/models/Human.ts

// Text interface moved to src/models/Text.ts

export class D1StorageService {
  private db: D1Database;
  private humanModel?: Human;

  constructor(db: D1Database) {
    this.db = db;
  }

  setHumanModel(humanModel: Human): void {
    this.humanModel = humanModel;
  }

  async initialize(): Promise<void> {
    console.log('🗄️ D1 Storage Service initialized');
    
    // Check that messages table exists
    try {
      const result = await this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='messages'").first();
      if (result) {
        console.log('✅ D1: messages table exists');
      } else {
        console.error('❌ D1: messages table does not exist!');
      }
    } catch (error) {
      console.error('❌ D1: Error checking messages table:', error);
    }
  }

  // Humans methods moved to src/models/Human.ts


  // Get user by topic_id
  async getUserIdByTopic(topicId: number): Promise<number | null> {
    console.log(`Getting user ID for topic ${topicId}`);

    try {
      const result = await this.db.prepare(`
        SELECT telegram_id FROM users WHERE topic_id = ?
      `).bind(topicId).first();

      if (result) {
        const userId = result.telegram_id as number;
        console.log(`Found user ID ${userId} for topic ${topicId}`);
        return userId;
      } else {
        console.log(`No user found for topic ${topicId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting user ID for topic ${topicId}:`, error);
      throw error;
    }
  }


  // Methods for working with messages
  async addMessage(message: Message): Promise<number> {
    console.log(`💾 D1: Adding message for user ${message.userId}, type: ${message.messageType}, direction: ${message.direction}`);
    console.log(`💾 D1: Message content: ${message.content?.substring(0, 100)}...`);

    try {
      // Check database connection
      if (!this.db) {
        throw new Error('D1 database connection is not initialized');
      }

      // Get human to get haid for maid field
      if (!this.humanModel) {
        throw new Error('Human model not initialized. Call setHumanModel() first.');
      }
      const human = await this.humanModel.getHumanById(message.userId);
      if (!human || !human.haid) {
        throw new Error(`Human with id ${message.userId} not found or has no haid`);
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


  // Execute queries and return results as array
  async execute(sql: string, params: any[] = []): Promise<any[]> {
    try {
      const stmt = this.db.prepare(sql).bind(...params);
      const result = await stmt.all();
      return result.results || [];
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }

}
