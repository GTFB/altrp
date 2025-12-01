import type { D1Database } from '@cloudflare/workers-types';
import type { PostgresD1Adapter } from '../nodejs/postgres-d1-adapter';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';
import { D1StorageService } from '../worker/d1-storage-service';

export interface MessageThreadData {
  id?: number;
  uuid?: string;
  maid: string;
  parentMaid?: string;
  title?: string;
  statusName?: string;
  type?: string;
  order?: number;
  xaid?: string;
  value?: string;
  updatedAt?: string;
  createdAt?: string;
  deletedAt?: number;
  gin?: string;
  dataIn?: string;
}

export interface MessageThreadConfig {
  db: D1Database | PostgresD1Adapter;
  d1Storage: D1StorageService;
}

/**
 * Repository for working with message_threads table
 * Uses D1Database API (or PostgresD1Adapter which mimics it)
 */
export class MessageThreadRepository {
  private db: D1Database | PostgresD1Adapter;
  private d1Storage: D1StorageService;

  constructor(config: MessageThreadConfig) {
    this.db = config.db;
    this.d1Storage = config.d1Storage;
  }

  private mapRowToMessageThread(row: any): MessageThreadData {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      maid: row.maid as string,
      parentMaid: row.parent_maid as string | undefined,
      title: row.title as string | undefined,
      statusName: row.status_name as string | undefined,
      type: row.type as string | undefined,
      order: row.order as number | undefined,
      xaid: row.xaid as string | undefined,
      value: row.value as string | undefined,
      updatedAt: row.updated_at as string | undefined,
      createdAt: row.created_at as string | undefined,
      deletedAt: row.deleted_at as number | undefined,
      gin: row.gin as string | undefined,
      dataIn: row.data_in as string | undefined
    };
  }

  /**
   * Add message thread to database
   */
  async addMessageThread(thread: MessageThreadData): Promise<number> {
    const uuid = generateUuidV4();
    const maid = generateAid('m');
    
    console.log(`Adding message thread ${maid} to D1 database`);

    try {
      const result = await this.db.prepare(`
        INSERT INTO message_threads (
          uuid, maid, parent_maid, title, status_name, type,
          \`order\`, xaid, value,
          deleted_at, gin, data_in
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        uuid,
        maid,
        thread.parentMaid || null,
        thread.title || null,
        thread.statusName || null,
        thread.type || null,
        thread.order ?? 0,
        thread.xaid || null,
        thread.value || null,
        thread.deletedAt || null,
        thread.gin || null,
        thread.dataIn || null
      ).run();

      console.log(`Message thread ${maid} added to D1 database with ID: ${result.meta.last_row_id}`);
      return result.meta.last_row_id as number;
    } catch (error) {
      console.error(`Error adding message thread ${maid}:`, error);
      throw error;
    }
  }

  /**
   * Get message thread by value (topic_id)
   */
  async getMessageThreadByValue(value: string, type: string = 'leadsgen'): Promise<MessageThreadData | null> {
    try {
      const result = await this.d1Storage.execute(`
        SELECT id, uuid, maid, parent_maid, title, status_name, type, 
               \`order\`, xaid, value, updated_at, created_at, deleted_at, gin, data_in
        FROM message_threads 
        WHERE value = ? AND type = ? AND deleted_at IS NULL
        LIMIT 1
      `, [value, type]);

      if (!result || result.length === 0) {
        return null;
      }

      const row = result[0] as any;
      return this.mapRowToMessageThread(row);
    } catch (error) {
      console.error(`Error getting message thread by value ${value}:`, error);
      return null;
    }
  }

  async getParentThreadsByType(type: string): Promise<MessageThreadData[]> {
    try {
      const result = await this.d1Storage.execute(`
        SELECT id, uuid, maid, parent_maid, title, status_name, type, 
               \`order\`, xaid, value, updated_at, created_at, deleted_at, gin, data_in
        FROM message_threads 
        WHERE type = ? AND parent_maid IS NULL AND deleted_at IS NULL
      `, [type]);

      if (!result || result.length === 0) {
        return [];
      }

      return (result as any[]).map(row => this.mapRowToMessageThread(row));
    } catch (error) {
      console.error(`Error getting parent message threads for type ${type}:`, error);
      return [];
    }
  }

  async getThreadByXaidAndStatus(xaid: string, statusName: string, type: string): Promise<MessageThreadData | null> {
    try {
      const result = await this.d1Storage.execute(`
        SELECT id, uuid, maid, parent_maid, title, status_name, type, 
               \`order\`, xaid, value, updated_at, created_at, deleted_at, gin, data_in
        FROM message_threads 
        WHERE xaid = ? AND status_name = ? AND type = ? AND deleted_at IS NULL
        LIMIT 1
      `, [xaid, statusName, type]);

      if (!result || result.length === 0) {
        return null;
      }

      return this.mapRowToMessageThread(result[0]);
    } catch (error) {
      console.error(`Error getting thread by xaid ${xaid} and status ${statusName}:`, error);
      return null;
    }
  }

  /**
   * Update message thread in database
   */
  async updateMessageThread(id: number, updates: Partial<MessageThreadData>): Promise<void> {
    console.log(`Updating message thread ${id} in D1 database`);

    try {
      const updateFields: string[] = [];
      const values: any[] = [];

      if (updates.maid !== undefined) {
        updateFields.push('maid = ?');
        values.push(updates.maid);
      }
      if (updates.parentMaid !== undefined) {
        updateFields.push('parent_maid = ?');
        values.push(updates.parentMaid);
      }
      if (updates.title !== undefined) {
        updateFields.push('title = ?');
        values.push(updates.title);
      }
      if (updates.statusName !== undefined) {
        updateFields.push('status_name = ?');
        values.push(updates.statusName);
      }
      if (updates.type !== undefined) {
        updateFields.push('type = ?');
        values.push(updates.type);
      }
      if (updates.order !== undefined) {
        updateFields.push('`order` = ?');
        values.push(updates.order);
      }
      if (updates.xaid !== undefined) {
        updateFields.push('xaid = ?');
        values.push(updates.xaid);
      }
      if (updates.value !== undefined) {
        updateFields.push('value = ?');
        values.push(updates.value);
      }
      if (updates.deletedAt !== undefined) {
        updateFields.push('deleted_at = ?');
        values.push(updates.deletedAt);
      }
      if (updates.gin !== undefined) {
        updateFields.push('gin = ?');
        values.push(updates.gin);
      }
      if (updates.dataIn !== undefined) {
        updateFields.push('data_in = ?');
        values.push(updates.dataIn);
      }

      // Always update updated_at
      updateFields.push('updated_at = ?');
      values.push(new Date().toISOString());

      if (updateFields.length === 1) {
        // Only updated_at, nothing to update
        console.log(`No fields to update for message thread ${id}`);
        return;
      }

      values.push(id);

      const query = `
        UPDATE message_threads
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await this.d1Storage.execute(query, values);
      console.log(`Message thread ${id} updated successfully`);
    } catch (error) {
      console.error(`Error updating message thread ${id}:`, error);
      throw error;
    }
  }
}

