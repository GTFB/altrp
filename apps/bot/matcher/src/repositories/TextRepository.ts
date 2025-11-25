import type { D1Database } from '@cloudflare/workers-types';
import type { PostgresD1Adapter } from '../nodejs/postgres-d1-adapter';

export interface TextData {
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

export interface TextConfig {
  db: D1Database | PostgresD1Adapter;
}

/**
 * Repository for working with texts table
 * Uses D1Database API (or PostgresD1Adapter which mimics it)
 */
export class TextRepository {
  private db: D1Database | PostgresD1Adapter;

  constructor(config: TextConfig) {
    this.db = config.db;
  }

  /**
   * Get text by taid
   */
  async getTextByTaid(taid: string): Promise<TextData | null> {
    console.log(`Getting text by taid ${taid} from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT * FROM texts 
        WHERE taid = ? 
        AND deleted_at IS NULL
      `).bind(taid).first();

      if (result) {
        const text: TextData = {
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

  /**
   * Get taid by content
   */
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
        console.log(`Taid found for content: ${result.taid}`);
        return result.taid as string;
      } else {
        console.log(`Taid not found for content in D1 database`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting taid by content:`, error);
      throw error;
    }
  }
}
