import type { D1Database } from '@cloudflare/workers-types';
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
  db: D1Database;
  d1Storage: D1StorageService;
}

/**
 * Repository for working with message_threads table
 */
export class MessageThreadRepository {
  private db: D1Database;
  private d1Storage: D1StorageService;

  constructor(config: MessageThreadConfig) {
    this.db = config.db;
    this.d1Storage = config.d1Storage;
  }

  /**
   * Add message thread to database
   */
  async addMessageThread(thread: MessageThreadData): Promise<number> {
    console.log(`Adding message thread ${thread.maid} to D1 database`);

    try {
      const uuid = thread.uuid || generateUuidV4();

      const result = await this.db.prepare(`
        INSERT INTO message_threads (
          uuid, maid, parent_maid, title, status_name, type,
          \`order\`, xaid, value,
          deleted_at, gin, data_in
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        uuid,
        thread.maid,
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

      console.log(`Message thread ${thread.maid} added to D1 database with ID: ${result.meta.last_row_id}`);
      return result.meta.last_row_id as number;
    } catch (error) {
      console.error(`Error adding message thread ${thread.maid}:`, error);
      throw error;
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

