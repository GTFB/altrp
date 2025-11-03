import { D1Database } from '@cloudflare/workers-types';
import { generateUuidV4, generateAid } from '../core/helpers';

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

export interface Human {
  id?: number; // Auto-increment ID from humans table
  uuid?: string;
  haid?: string;
  fullName: string;
  birthday?: string;
  email?: string;
  sex?: string;
  statusName?: string;
  type?: string;
  cityName?: string;
  order?: number;
  xaid?: string;
  mediaId?: string;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: number;
  gin?: string;
  fts?: string;
  dataIn?: string;
  dataOut?: string;
}

export interface Text {
  id?: number; // Auto-increment ID from texts table
  uuid?: string;
  taid?: string;
  title?: string;
  type?: string;
  statusName?: string;
  isPublic?: number;
  order?: number;
  xaid?: string;
  content?: string; // Text content
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: number;
  gin?: string;
  fts?: string;
  dataIn?: string;
  dataOut?: string;
}

export class D1StorageService {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
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

  // Users
  async addUser(user: User): Promise<void> {
    console.log(`Adding user ${user.telegramId} to D1 database`);

    try {
      await this.db.prepare(`
        INSERT OR IGNORE INTO users (telegram_id, first_name, last_name, username, registered_at, topic_id, data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        user.telegramId,
        user.firstName || null,
        user.lastName || null,
        user.username || null,
        user.registeredAt,
        user.topicId || null,
        user.data || null
      ).run();

      console.log(`User ${user.telegramId} added to D1 database`);
    } catch (error) {
      console.error(`Error adding user ${user.telegramId}:`, error);
      throw error;
    }
  }

  async getUser(telegramId: number): Promise<User | null> {
    console.log(`Getting user ${telegramId} from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT * FROM users WHERE telegram_id = ?
      `).bind(telegramId).first();

      if (result) {
        const user: User = {
          id: result.id as number,
          telegramId: result.telegram_id as number,
          firstName: (result.first_name as string) || '',
          lastName: (result.last_name as string) || '',
          username: (result.username as string) || '',
          registeredAt: result.registered_at as string,
          topicId: (result.topic_id as number) || 0,
          language: (result.language as string) || '',
          data: (result.data as string) || ''
        };
        console.log(`User ${telegramId} found with topicId: ${user.topicId}, DB ID: ${user.id}`);
        return user;
      } else {
        console.log(`User ${telegramId} not found in D1 database`);
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
      const result = await this.db.prepare(`
        UPDATE users SET topic_id = ? WHERE telegram_id = ?
      `).bind(topicId, telegramId).run();

      console.log(`Topic update result:`, result);
      console.log(`Topic updated for user ${telegramId} - changes: ${result.meta.changes}`);
      
      if (result.meta.changes === 0) {
        console.warn(`No rows were updated for user ${telegramId}. User might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating topic for user ${telegramId}:`, error);
      throw error;
    }
  }

  async updateUser(telegramId: number, updates: { language?: string }): Promise<void> {
    console.log(`Updating user ${telegramId} with:`, updates);

    try {
      const setParts: string[] = [];
      const values: any[] = [];
      
      if (updates.language !== undefined) {
        setParts.push('language = ?');
        values.push(updates.language);
      }
      
      if (setParts.length === 0) {
        console.warn('No valid updates provided');
        return;
      }
      
      values.push(telegramId); // Add telegramId for WHERE clause
      
      const result = await this.db.prepare(`
        UPDATE users SET ${setParts.join(', ')} WHERE telegram_id = ?
      `).bind(...values).run();

      console.log(`User update result:`, result);
      console.log(`User ${telegramId} updated - changes: ${result.meta.changes}`);
      
      if (result.meta.changes === 0) {
        console.warn(`No rows were updated for user ${telegramId}. User might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating user ${telegramId}:`, error);
      throw error;
    }
  }

  async updateUserData(telegramId: number, data: string): Promise<void> {
    console.log(`Updating data for user ${telegramId}`);

    try {
      const result = await this.db.prepare(`
        UPDATE users SET data = ? WHERE telegram_id = ?
      `).bind(data, telegramId).run();

      console.log(`Data update result:`, result);
      console.log(`Data updated for user ${telegramId} - changes: ${result.meta.changes}`);
      
      if (result.meta.changes === 0) {
        console.warn(`No rows were updated for user ${telegramId}. User might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating data for user ${telegramId}:`, error);
      throw error;
    }
  }

  // Humans
  async addHuman(human: Human): Promise<number> {
    console.log(`Adding human ${human.fullName} to D1 database`);

    try {

      const uuid = human.uuid || generateUuidV4();
      const haid = human.haid || generateAid('h');
      const now = new Date().toISOString();

      const result = await this.db.prepare(`
        INSERT INTO humans (
          uuid, haid, full_name, birthday, email, sex, status_name, type,
          city_name, \`order\`, xaid, media_id, updated_at, created_at,
          deleted_at, gin, fts, data_in, data_out
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        uuid,
        haid,
        human.fullName,
        human.birthday || null,
        human.email || null,
        human.sex || null,
        human.statusName || null,
        human.type || null,
        human.cityName || null,
        human.order ?? 0,
        human.xaid || null,
        human.mediaId || null,
        now,
        now,
        human.deletedAt || null,
        human.gin || null,
        human.fts || null,
        human.dataIn || null,
        human.dataOut || null
      ).run();

      console.log(`Human ${human.fullName} added to D1 database with ID: ${result.meta.last_row_id}`);
      return result.meta.last_row_id as number;
    } catch (error) {
      console.error(`Error adding human ${human.fullName}:`, error);
      throw error;
    }
  }

  async getHumanByTelegramId(telegramId: number): Promise<Human | null> {
    console.log(`Getting human by telegram_id ${telegramId} from D1 database`);

    try {

      const result = await this.db.prepare(`
        SELECT * FROM humans 
        WHERE json_extract(data_in, '$.telegram_id') = ?
        AND deleted_at IS NULL
      `).bind(telegramId).first();

      if (result) {
        const human: Human = {
          id: result.id as number,
          uuid: result.uuid as string,
          haid: result.haid as string,
          fullName: result.full_name as string,
          birthday: result.birthday as string || undefined,
          email: result.email as string || undefined,
          sex: result.sex as string || undefined,
          statusName: result.status_name as string || undefined,
          type: result.type as string || undefined,
          cityName: result.city_name as string || undefined,
          order: result.order as number || 0,
          xaid: result.xaid as string || undefined,
          mediaId: result.media_id as string || undefined,
          updatedAt: result.updated_at as string,
          createdAt: result.created_at as string,
          deletedAt: result.deleted_at as number || undefined,
          gin: result.gin as string || undefined,
          fts: result.fts as string || undefined,
          dataIn: result.data_in as string || undefined,
          dataOut: result.data_out as string || undefined
        };
        console.log(`Human with telegram_id ${telegramId} found with DB ID: ${human.id}`);
        return human;
      } else {
        console.log(`Human with telegram_id ${telegramId} not found in D1 database`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting human by telegram_id ${telegramId}:`, error);
      throw error;
    }
  }

  async getHumanById(id: number): Promise<Human | null> {
    console.log(`Getting human by id ${id} from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT * FROM humans 
        WHERE id = ? AND deleted_at IS NULL
      `).bind(id).first();

      if (result) {
        const human: Human = {
          id: result.id as number,
          uuid: result.uuid as string,
          haid: result.haid as string,
          fullName: result.full_name as string,
          birthday: result.birthday as string || undefined,
          email: result.email as string || undefined,
          sex: result.sex as string || undefined,
          statusName: result.status_name as string || undefined,
          type: result.type as string || undefined,
          cityName: result.city_name as string || undefined,
          order: result.order as number || 0,
          xaid: result.xaid as string || undefined,
          mediaId: result.media_id as string || undefined,
          updatedAt: result.updated_at as string,
          createdAt: result.created_at as string,
          deletedAt: result.deleted_at as number || undefined,
          gin: result.gin as string || undefined,
          fts: result.fts as string || undefined,
          dataIn: result.data_in as string || undefined,
          dataOut: result.data_out as string || undefined
        };
        console.log(`Human with id ${id} found`);
        return human;
      } else {
        console.log(`Human with id ${id} not found in D1 database`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting human by id ${id}:`, error);
      throw error;
    }
  }

  async updateHuman(telegramId: number, updates: Partial<Human>): Promise<void> {
    console.log(`Updating human with telegram_id ${telegramId} with:`, updates);

    try {
      const setParts: string[] = [];
      const values: any[] = [];
      
      if (updates.fullName !== undefined) {
        setParts.push('full_name = ?');
        values.push(updates.fullName);
      }
      if (updates.birthday !== undefined) {
        setParts.push('birthday = ?');
        values.push(updates.birthday);
      }
      if (updates.email !== undefined) {
        setParts.push('email = ?');
        values.push(updates.email);
      }
      if (updates.sex !== undefined) {
        setParts.push('sex = ?');
        values.push(updates.sex);
      }
      if (updates.statusName !== undefined) {
        setParts.push('status_name = ?');
        values.push(updates.statusName);
      }
      if (updates.type !== undefined) {
        setParts.push('type = ?');
        values.push(updates.type);
      }
      if (updates.cityName !== undefined) {
        setParts.push('city_name = ?');
        values.push(updates.cityName);
      }
      if (updates.order !== undefined) {
        setParts.push('`order` = ?');
        values.push(updates.order);
      }
      if (updates.xaid !== undefined) {
        setParts.push('xaid = ?');
        values.push(updates.xaid);
      }
      if (updates.mediaId !== undefined) {
        setParts.push('media_id = ?');
        values.push(updates.mediaId);
      }
      if (updates.gin !== undefined) {
        setParts.push('gin = ?');
        values.push(updates.gin);
      }
      if (updates.fts !== undefined) {
        setParts.push('fts = ?');
        values.push(updates.fts);
      }
      
      if (setParts.length === 0) {
        console.warn('No valid updates provided');
        return;
      }
      
      setParts.push('updated_at = ?');
      values.push(new Date().toISOString());
      
      values.push(telegramId);
      
      const result = await this.db.prepare(`
        UPDATE humans 
        SET ${setParts.join(', ')} 
        WHERE json_extract(data_in, '$.telegram_id') = ?
        AND deleted_at IS NULL
      `).bind(...values).run();

      console.log(`Human update result:`, result);
      console.log(`Human with telegram_id ${telegramId} updated - changes: ${result.meta.changes}`);
      
      if (result.meta.changes === 0) {
        console.warn(`No rows were updated for human with telegram_id ${telegramId}. Human might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating human with telegram_id ${telegramId}:`, error);
      throw error;
    }
  }

  async updateHumanDataIn(telegramId: number, dataIn: string): Promise<void> {
    console.log(`Updating data_in for human with telegram_id ${telegramId}`);

    try {
      const result = await this.db.prepare(`
        UPDATE humans 
        SET data_in = ?, updated_at = ?
        WHERE json_extract(data_in, '$.telegram_id') = ?
        AND deleted_at IS NULL
      `).bind(dataIn, new Date().toISOString(), telegramId).run();

      console.log(`Data_in update result:`, result);
      console.log(`Data_in updated for human with telegram_id ${telegramId} - changes: ${result.meta.changes}`);
      
      if (result.meta.changes === 0) {
        console.warn(`No rows were updated for human with telegram_id ${telegramId}. Human might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating data_in for human with telegram_id ${telegramId}:`, error);
      throw error;
    }
  }

  async updateHumanDataOut(telegramId: number, dataOut: string): Promise<void> {
    console.log(`Updating data_out for human with telegram_id ${telegramId}`);

    try {
      const result = await this.db.prepare(`
        UPDATE humans 
        SET data_out = ?, updated_at = ?
        WHERE json_extract(data_in, '$.telegram_id') = ?
        AND deleted_at IS NULL
      `).bind(dataOut, new Date().toISOString(), telegramId).run();

      console.log(`Data_out update result:`, result);
      console.log(`Data_out updated for human with telegram_id ${telegramId} - changes: ${result.meta.changes}`);
      
      if (result.meta.changes === 0) {
        console.warn(`No rows were updated for human with telegram_id ${telegramId}. Human might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating data_out for human with telegram_id ${telegramId}:`, error);
      throw error;
    }
  }

  async getAllHumans(includeDeleted: boolean = false): Promise<Human[]> {
    try {
      const whereClause = includeDeleted ? '' : 'WHERE deleted_at IS NULL';
      const results = await this.db.prepare(`
        SELECT * FROM humans ${whereClause} ORDER BY created_at DESC
      `).all();

      return results.results.map((row: any) => ({
        id: row.id as number,
        uuid: row.uuid as string,
        haid: row.haid as string,
        fullName: row.full_name as string,
        birthday: row.birthday as string || undefined,
        email: row.email as string || undefined,
        sex: row.sex as string || undefined,
        statusName: row.status_name as string || undefined,
        type: row.type as string || undefined,
        cityName: row.city_name as string || undefined,
        order: row.order as number || 0,
        xaid: row.xaid as string || undefined,
        mediaId: row.media_id as string || undefined,
        updatedAt: row.updated_at as string,
        createdAt: row.created_at as string,
        deletedAt: row.deleted_at as number || undefined,
        gin: row.gin as string || undefined,
        fts: row.fts as string || undefined,
        dataIn: row.data_in as string || undefined,
        dataOut: row.data_out as string || undefined
      }));
    } catch (error) {
      console.error('Error getting all humans:', error);
      throw error;
    }
  }

  async updateHumanTopic(telegramId: number, topicId: number): Promise<void> {
    console.log(`Updating topic for human with telegram_id ${telegramId} to ${topicId}`);

    try {

      const human = await this.getHumanByTelegramId(telegramId);
      if (!human) {
        throw new Error(`Human with telegram_id ${telegramId} not found`);
      }

      let dataInObj: any = {};
      if (human.dataIn) {
        try {
          dataInObj = JSON.parse(human.dataIn);
        } catch (e) {
          console.warn(`Failed to parse data_in for human ${telegramId}, using empty object`);
        }
      }

      dataInObj.topic_id = topicId;
      const newDataIn = JSON.stringify(dataInObj);

      const result = await this.db.prepare(`
        UPDATE humans 
        SET data_in = ?, updated_at = ?
        WHERE json_extract(data_in, '$.telegram_id') = ?
        AND deleted_at IS NULL
      `).bind(newDataIn, new Date().toISOString(), telegramId).run();

      console.log(`Topic update result:`, result);
      console.log(`Topic updated for human with telegram_id ${telegramId} - changes: ${result.meta.changes}`);
      
      if (result.meta.changes === 0) {
        console.warn(`No rows were updated for human with telegram_id ${telegramId}. Human might not exist.`);
      }
    } catch (error) {
      console.error(`Error updating topic for human with telegram_id ${telegramId}:`, error);
      throw error;
    }
  }

  async humanExists(telegramId: number): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM humans 
        WHERE json_extract(data_in, '$.telegram_id') = ?
        AND deleted_at IS NULL
      `).bind(telegramId).first();

      return (result?.count as number) > 0;
    } catch (error) {
      console.error(`Error checking if human with telegram_id ${telegramId} exists:`, error);
      return false;
    }
  }

  async getHumanTelegramIdByTopic(topicId: number): Promise<number | null> {
    console.log(`Getting human telegram_id for topic ${topicId}`);

    try {
      const result = await this.db.prepare(`
        SELECT json_extract(data_in, '$.telegram_id') as telegram_id
        FROM humans 
        WHERE json_extract(data_in, '$.topic_id') = ?
        AND deleted_at IS NULL
      `).bind(topicId).first();

      if (result && result.telegram_id !== null) {
        const telegramId = result.telegram_id as number;
        console.log(`Found human telegram_id ${telegramId} for topic ${topicId}`);
        return telegramId;
      } else {
        console.log(`No human found for topic ${topicId}`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting human telegram_id for topic ${topicId}:`, error);
      throw error;
    }
  }

  // Sessions
  async setSession(key: string, value: any): Promise<void> {
    try {
      const telegramUserId = this.extractUserIdFromKey(key);
      const sessionData = JSON.stringify(value);
      
      // Get user ID from users table
      const user = await this.getUser(telegramUserId);
      if (!user || !user.id) {
        throw new Error(`User with telegram ID ${telegramUserId} not found`);
      }
      
      await this.db.prepare(`
        INSERT OR REPLACE INTO sessions (user_id, session_key, session_data, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `).bind(user.id, key, sessionData).run();
      
      console.log(`📝 Session saved for user ${telegramUserId} (DB ID: ${user.id})`);
    } catch (error) {
      console.error(`Error setting session ${key}:`, error);
      throw error;
    }
  }

  async getSession(key: string): Promise<any | null> {
    try {
      const result = await this.db.prepare(`
        SELECT session_data FROM sessions WHERE session_key = ?
      `).bind(key).first();

      if (result) {
        return JSON.parse(result.session_data as string);
      }
      return null;
    } catch (error) {
      console.error(`Error getting session ${key}:`, error);
      throw error;
    }
  }

  async deleteSession(key: string): Promise<void> {
    try {
      await this.db.prepare(`
        DELETE FROM sessions WHERE session_key = ?
      `).bind(key).run();
    } catch (error) {
      console.error(`Error deleting session ${key}:`, error);
      throw error;
    }
  }

  // Registrations
  async addRegistration(registration: Registration): Promise<number> {
    console.log(`Adding registration for user ${registration.userId}`);

    try {
      const result = await this.db.prepare(`
        INSERT INTO registrations (user_id, group_id, parent_name, child_name, child_age, phone, additional_courses, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        registration.userId,
        registration.groupId,
        registration.parentName,
        registration.childName,
        registration.childAge,
        registration.phone,
        registration.additionalCourses || null,
        registration.status
      ).run();

      console.log(`Registration added with ID: ${result.meta.last_row_id}`);
      return result.meta.last_row_id as number;
    } catch (error) {
      console.error(`Error adding registration:`, error);
      throw error;
    }
  }

  async getRegistrations(userId: number): Promise<Registration[]> {
    try {
      const results = await this.db.prepare(`
        SELECT * FROM registrations WHERE user_id = ? ORDER BY created_at DESC
      `).bind(userId).all();

      return results.results.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        groupId: row.group_id,
        parentName: row.parent_name,
        childName: row.child_name,
        childAge: row.child_age,
        phone: row.phone,
        additionalCourses: row.additional_courses,
        status: row.status,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error(`Error getting registrations for user ${userId}:`, error);
      throw error;
    }
  }

  // Helper methods
  private extractUserIdFromKey(key: string): number {
    // Extract user_id from key like "user:123"
    const match = key.match(/user:(\d+)/);
    return match ? parseInt(match[1] || '0') : 0;
  }

  // Check user existence
  async userExists(userId: number): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count FROM users WHERE user_id = ?
      `).bind(userId).first();

      return (result?.count as number) > 0;
    } catch (error) {
      console.error(`Error checking if user ${userId} exists:`, error);
      return false;
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

  // Get all users (for debugging)
  async getAllUsers(): Promise<User[]> {
    try {
      const results = await this.db.prepare(`
        SELECT * FROM users ORDER BY registered_at DESC
      `).all();

      return results.results.map((row: any) => ({
        id: row.id as number,
        telegramId: row.telegram_id as number,
        firstName: (row.first_name as string) || '',
        lastName: (row.last_name as string) || '',
        username: (row.username as string) || '',
        registeredAt: row.registered_at as string,
        topicId: (row.topic_id as number) || 0,
        language: (row.language as string) || '',
        data: (row.data as string) || ''
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  // Methods for working with courses and groups (if needed)
  async getCourses(): Promise<any[]> {
    try {
      const results = await this.db.prepare(`
        SELECT * FROM courses ORDER BY name
      `).all();

      return results.results;
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  }

  async getGroups(): Promise<any[]> {
    try {
      const results = await this.db.prepare(`
        SELECT g.*, c.name as course_name 
        FROM groups g 
        JOIN courses c ON g.course_id = c.id 
        ORDER BY g.weekday, g.time
      `).all();

      return results.results;
    } catch (error) {
      console.error('Error getting groups:', error);
      throw error;
    }
  }

  async getGroupsByWeekday(weekday: string): Promise<any[]> {
    try {
      const results = await this.db.prepare(`
        SELECT g.*, c.name as course_name 
        FROM groups g 
        JOIN courses c ON g.course_id = c.id 
        WHERE g.weekday = ?
        ORDER BY g.time
      `).bind(weekday).all();

      return results.results;
    } catch (error) {
      console.error(`Error getting groups for weekday ${weekday}:`, error);
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

      console.log(`💾 D1: Preparing SQL statement...`);
      
      const query = `
        INSERT INTO messages (
          user_id, message_type, direction, content, telegram_message_id, 
          callback_data, command_name, file_id, file_name, caption,
          topic_id, data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
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

  async getMessages(userId: number, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      const results = await this.db.prepare(`
        SELECT * FROM messages 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).bind(userId, limit, offset).all();

      return results.results.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        messageType: row.message_type,
        direction: row.direction,
        content: row.content,
        telegramMessageId: row.telegram_message_id,
        callbackData: row.callback_data,
        commandName: row.command_name,
        fileId: row.file_id,
        fileName: row.file_name,
        caption: row.caption,
        topicId: row.topic_id,
        data: row.data,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error(`Error getting messages for user ${userId}:`, error);
      throw error;
    }
  }

  async getMessagesByType(messageType: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      const results = await this.db.prepare(`
        SELECT * FROM messages 
        WHERE message_type = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).bind(messageType, limit, offset).all();

      return results.results.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        messageType: row.message_type,
        direction: row.direction,
        content: row.content,
        telegramMessageId: row.telegram_message_id,
        callbackData: row.callback_data,
        commandName: row.command_name,
        fileId: row.file_id,
        fileName: row.file_name,
        caption: row.caption,
        topicId: row.topic_id,
        data: row.data,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error(`Error getting messages by type ${messageType}:`, error);
      throw error;
    }
  }

  async getMessagesByDirection(direction: 'incoming' | 'outgoing', limit: number = 50, offset: number = 0): Promise<Message[]> {
    try {
      const results = await this.db.prepare(`
        SELECT * FROM messages 
        WHERE direction = ? 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `).bind(direction, limit, offset).all();

      return results.results.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        messageType: row.message_type,
        direction: row.direction,
        content: row.content,
        telegramMessageId: row.telegram_message_id,
        callbackData: row.callback_data,
        commandName: row.command_name,
        fileId: row.file_id,
        fileName: row.file_name,
        caption: row.caption,
        topicId: row.topic_id,
        data: row.data,
        createdAt: row.created_at
      }));
    } catch (error) {
      console.error(`Error getting messages by direction ${direction}:`, error);
      throw error;
    }
  }

  async getMessageStats(userId?: number): Promise<{ total: number; byType: Record<string, number>; byDirection: Record<string, number> }> {
    try {
      let whereClause = '';
      let params: any[] = [];
      
      if (userId) {
        whereClause = 'WHERE user_id = ?';
        params = [userId];
      }

      // Total number of messages
      const totalResult = await this.db.prepare(`
        SELECT COUNT(*) as total FROM messages ${whereClause}
      `).bind(...params).first();

      // Count by types
      const typeResults = await this.db.prepare(`
        SELECT message_type, COUNT(*) as count 
        FROM messages ${whereClause}
        GROUP BY message_type
      `).bind(...params).all();

      // Count by directions
      const directionResults = await this.db.prepare(`
        SELECT direction, COUNT(*) as count 
        FROM messages ${whereClause}
        GROUP BY direction
      `).bind(...params).all();

      const byType: Record<string, number> = {};
      typeResults.results.forEach((row: any) => {
        byType[row.message_type] = row.count;
      });

      const byDirection: Record<string, number> = {};
      directionResults.results.forEach((row: any) => {
        byDirection[row.direction] = row.count;
      });

      return {
        total: totalResult?.total as number || 0,
        byType,
        byDirection
      };
    } catch (error) {
      console.error('Error getting message stats:', error);
      throw error;
    }
  }

  async deleteOldMessages(daysOld: number = 30): Promise<number> {
    try {
      const result = await this.db.prepare(`
        DELETE FROM messages
        WHERE created_at < datetime('now', '-${daysOld} days')
      `).run();

      console.log(`Deleted ${result.meta.changes} old messages`);
      return result.meta.changes as number;
    } catch (error) {
      console.error(`Error deleting old messages:`, error);
      throw error;
    }
  }

  // Universal method for executing arbitrary SQL queries
  async executeQuery(sql: string, params: any[] = []): Promise<any> {
    try {
      const result = await this.db.prepare(sql).bind(...params).run();
      return result;
    } catch (error) {
      console.error('Error executing query:', error);
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

  // Texts
  async getTextByTaid(taid: string): Promise<Text | null> {
    console.log(`Getting text by taid ${taid} from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT * FROM texts 
        WHERE taid = ? 
        AND deleted_at IS NULL
      `).bind(taid).first();

      if (result) {
        const text: Text = {
          id: result.id as number,
          uuid: result.uuid as string || undefined,
          taid: result.taid as string || undefined,
          title: result.title as string || undefined,
          type: result.type as string || undefined,
          statusName: result.status_name as string || undefined,
          isPublic: result.is_public as number || undefined,
          order: result.order as number || 0,
          xaid: result.xaid as string || undefined,
          content: result.content as string || undefined,
          updatedAt: result.updated_at as string,
          createdAt: result.created_at as string,
          deletedAt: result.deleted_at as number || undefined,
          gin: result.gin as string || undefined,
          fts: result.fts as string || undefined,
          dataIn: result.data_in as string || undefined,
          dataOut: result.data_out as string || undefined
        };
        console.log(`Text with taid ${taid} found with DB ID: ${text.id}`);
        return text;
      } else {
        console.log(`Text with taid ${taid} not found in D1 database`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting text by taid ${taid}:`, error);
      throw error;
    }
  }

  async getTaidByContent(content: string): Promise<string | null> {
    console.log(`Getting taid by content from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT taid FROM texts 
        WHERE content = ? 
        AND deleted_at IS NULL
        LIMIT 1
      `).bind(content).first();

      if (result && result.taid) {
        const taid = result.taid as string;
        console.log(`Taid found for content: ${taid}`);
        return taid;
      } else {
        console.log(`No taid found for given content`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting taid by content:`, error);
      throw error;
    }
  }
}
