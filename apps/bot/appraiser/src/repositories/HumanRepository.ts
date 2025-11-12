import type { D1Database } from '@cloudflare/workers-types';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';

export interface HumanData {
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

export interface HumanConfig {
  db: D1Database;
}

/**
 * Repository for working with humans table
 */
export class HumanRepository {
  private db: D1Database;

  constructor(config: HumanConfig) {
    this.db = config.db;
  }

  /**
   * Add human to database
   */
  async addHuman(human: HumanData): Promise<number> {
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

  /**
   * Get human by telegram ID
   */
  async getHumanByTelegramId(telegramId: number): Promise<HumanData | null> {
    console.log(`Getting human by telegram_id ${telegramId} from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT * FROM humans 
        WHERE json_extract(data_in, '$.telegram_id') = ?
        AND deleted_at IS NULL
      `).bind(telegramId).first();

      if (result) {
        const human: HumanData = {
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

  /**
   * Get human by ID
   */
  async getHumanById(id: number): Promise<HumanData | null> {
    console.log(`Getting human by id ${id} from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT * FROM humans 
        WHERE id = ? AND deleted_at IS NULL
      `).bind(id).first();

      if (result) {
        const human: HumanData = {
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

  /**
   * Get human by haid
   */
  async getHumanByHaid(haid: string): Promise<HumanData | null> {
    console.log(`Getting human by haid ${haid} from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT * FROM humans 
        WHERE haid = ? AND deleted_at IS NULL
      `).bind(haid).first();

      if (result) {
        const human: HumanData = {
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
        console.log(`Human with haid ${haid} found with DB ID: ${human.id}`);
        return human;
      } else {
        console.log(`Human with haid ${haid} not found in D1 database`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting human by haid ${haid}:`, error);
      throw error;
    }
  }

  /**
   * Update human
   */
  async updateHuman(telegramId: number, updates: Partial<HumanData>): Promise<void> {
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

  /**
   * Update human data_in
   */
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

  /**
   * Get human telegram ID by topic ID
   */
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
}
