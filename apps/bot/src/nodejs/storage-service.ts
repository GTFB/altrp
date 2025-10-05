// Node.js адаптеры для хранения данных
// Использует PostgreSQL и Redis вместо D1 и KV

import { Pool } from 'pg';
import { createClient } from 'redis';

// Интерфейсы для совместимости с существующим кодом
export interface User {
  id?: number;
  telegramId: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  registeredAt: string;
  topicId?: number;
  language?: string;
  data?: string;
}

export interface Message {
  id?: number;
  userId: number;
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
  data?: string;
  createdAt?: string;
}

// PostgreSQL Storage Service (аналог D1StorageService)
export class PostgreSQLStorageService {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async initialize(): Promise<void> {
    console.log('🗄️ PostgreSQL Storage Service initialized');
    
    // Проверяем подключение
    try {
      const client = await this.pool.connect();
      const result = await client.query("SELECT name FROM information_schema.tables WHERE table_name = 'messages'");
      client.release();
      
      if (result.rows.length > 0) {
        console.log('✅ PostgreSQL: messages table exists');
      } else {
        console.error('❌ PostgreSQL: messages table does not exist!');
      }
    } catch (error) {
      console.error('❌ PostgreSQL: Error checking messages table:', error);
    }
  }

  async addUser(user: User): Promise<void> {
    console.log(`Adding user ${user.telegramId} to PostgreSQL database`);

    try {
      await this.pool.query(`
        INSERT INTO users (telegram_id, first_name, last_name, username, registered_at, topic_id, data)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (telegram_id) DO NOTHING
      `, [
        user.telegramId,
        user.firstName || null,
        user.lastName || null,
        user.username || null,
        user.registeredAt,
        user.topicId || null,
        user.data || null
      ]);

      console.log(`User ${user.telegramId} added to PostgreSQL database`);
    } catch (error) {
      console.error(`Error adding user ${user.telegramId}:`, error);
      throw error;
    }
  }

  async getUser(telegramId: number): Promise<User | null> {
    console.log(`Getting user ${telegramId} from PostgreSQL database`);

    try {
      const result = await this.pool.query(`
        SELECT * FROM users WHERE telegram_id = $1
      `, [telegramId]);

      if (result.rows.length > 0) {
        const row = result.rows[0];
        const user: User = {
          id: row.id,
          telegramId: row.telegram_id,
          firstName: row.first_name || '',
          lastName: row.last_name || '',
          username: row.username || '',
          registeredAt: row.registered_at,
          topicId: row.topic_id || 0,
          language: row.language || '',
          data: row.data || ''
        };
        console.log(`User ${telegramId} found with topicId: ${user.topicId}, DB ID: ${user.id}`);
        return user;
      } else {
        console.log(`User ${telegramId} not found in PostgreSQL database`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting user ${telegramId}:`, error);
      throw error;
    }
  }

  async updateUserTopic(telegramId: number, topicId: number): Promise<void> {
    console.log(`Updating topic for user ${telegramId} to ${topicId}`);

    try {
      const result = await this.pool.query(`
        UPDATE users SET topic_id = $1 WHERE telegram_id = $2
      `, [topicId, telegramId]);

      console.log(`Topic updated for user ${telegramId} - changes: ${result.rowCount}`);
      
      if (result.rowCount === 0) {
        console.warn(`No rows were updated for user ${telegramId}. User might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating topic for user ${telegramId}:`, error);
      throw error;
    }
  }

  async updateUserData(telegramId: number, data: string): Promise<void> {
    console.log(`Updating data for user ${telegramId}`);

    try {
      const result = await this.pool.query(`
        UPDATE users SET data = $1 WHERE telegram_id = $2
      `, [data, telegramId]);

      console.log(`Data updated for user ${telegramId} - changes: ${result.rowCount}`);
      
      if (result.rowCount === 0) {
        console.warn(`No rows were updated for user ${telegramId}. User might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating data for user ${telegramId}:`, error);
      throw error;
    }
  }

  async setSession(key: string, value: any): Promise<void> {
    try {
      const telegramUserId = this.extractUserIdFromKey(key);
      const sessionData = JSON.stringify(value);
      
      const user = await this.getUser(telegramUserId);
      if (!user || !user.id) {
        throw new Error(`User with telegram ID ${telegramUserId} not found`);
      }
      
      await this.pool.query(`
        INSERT INTO sessions (user_id, session_key, session_data, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (session_key) DO UPDATE SET
        session_data = EXCLUDED.session_data,
        updated_at = NOW()
      `, [user.id, key, sessionData]);
      
      console.log(`📝 Session saved for user ${telegramUserId} (DB ID: ${user.id})`);
    } catch (error) {
      console.error(`Error setting session ${key}:`, error);
      throw error;
    }
  }

  async getSession(key: string): Promise<any | null> {
    try {
      const result = await this.pool.query(`
        SELECT session_data FROM sessions WHERE session_key = $1
      `, [key]);

      if (result.rows.length > 0) {
        return JSON.parse(result.rows[0].session_data);
      }
      return null;
    } catch (error) {
      console.error(`Error getting session ${key}:`, error);
      throw error;
    }
  }

  async deleteSession(key: string): Promise<void> {
    try {
      await this.pool.query(`
        DELETE FROM sessions WHERE session_key = $1
      `, [key]);
    } catch (error) {
      console.error(`Error deleting session ${key}:`, error);
      throw error;
    }
  }

  async getUserIdByTopic(topicId: number): Promise<number | null> {
    console.log(`Getting user ID for topic ${topicId}`);

    try {
      const result = await this.pool.query(`
        SELECT telegram_id FROM users WHERE topic_id = $1
      `, [topicId]);

      if (result.rows.length > 0) {
        const userId = result.rows[0].telegram_id;
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

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.pool.query(`
        SELECT * FROM users ORDER BY registered_at DESC
      `);

      return result.rows.map((row: any) => ({
        id: row.id,
        telegramId: row.telegram_id,
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        username: row.username || '',
        registeredAt: row.registered_at,
        topicId: row.topic_id || 0,
        language: row.language || '',
        data: row.data || ''
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async addMessage(message: Message): Promise<number> {
    console.log(`💾 PostgreSQL: Adding message for user ${message.userId}, type: ${message.messageType}, direction: ${message.direction}`);

    try {
      const result = await this.pool.query(`
        INSERT INTO messages (
          user_id, message_type, direction, content, telegram_message_id, 
          callback_data, command_name, file_id, file_name, caption,
          topic_id, data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        message.userId,
        message.messageType,
        message.direction,
        message.content || null,
        message.telegramMessageId || null,
        message.callbackData || null,
        message.commandName || null,
        message.fileId || null,
        message.fileName || null,
        message.caption || null,
        message.topicId || null,
        message.data || null
      ]);

      console.log(`✅ PostgreSQL: Message added successfully with ID: ${result.rows[0].id}`);
      return result.rows[0].id;
    } catch (error) {
      console.error(`❌ PostgreSQL: Error adding message:`, error);
      throw error;
    }
  }

  private extractUserIdFromKey(key: string): number {
    const match = key.match(/user:(\d+)/);
    return match ? parseInt(match[1] || '0') : 0;
  }
}

// Redis Storage Service (аналог KVStorageService)
export class RedisStorageService {
  private client: any;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });
  }

  async initialize(): Promise<void> {
    console.log('Redis Storage Service initialized');
    await this.client.connect();
  }

  async addUser(user: User): Promise<void> {
    console.log(`Adding user ${user.telegramId} to Redis storage`);
    
    const userKey = `user:${user.telegramId}`;
    const existingUser = await this.client.get(userKey);
    
    if (!existingUser) {
      await this.client.set(userKey, JSON.stringify(user));
      console.log(`User ${user.telegramId} added to Redis storage`);
    } else {
      console.log(`User ${user.telegramId} already exists in Redis storage`);
    }
  }

  async getUser(userId: number): Promise<User | null> {
    console.log(`Getting user ${userId} from Redis storage`);
    
    const userKey = `user:${userId}`;
    const userData = await this.client.get(userKey);
    
    if (userData) {
      const user: User = JSON.parse(userData);
      console.log(`User ${userId} found with topicId: ${user.topicId}`);
      return user;
    } else {
      console.log(`User ${userId} not found in Redis storage`);
      return null;
    }
  }

  async getSession(sessionId: string): Promise<any> {
    const sessionKey = `session:${sessionId}`;
    const sessionData = await this.client.get(sessionKey);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  async setSession(sessionId: string, sessionData: any): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.client.set(sessionKey, JSON.stringify(sessionData));
  }

  async deleteSession(sessionId: string): Promise<void> {
    const sessionKey = `session:${sessionId}`;
    await this.client.del(sessionKey);
  }
}
