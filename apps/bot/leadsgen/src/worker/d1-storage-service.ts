import { D1Database } from '@cloudflare/workers-types';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';
import { Human } from '../models/Human';

// Message interface moved to src/models/Message.ts

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
