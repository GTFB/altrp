import type { D1Database } from '@cloudflare/workers-types';

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
  db: D1Database;
}

/**
 * Repository for working with texts table
 */
export class TextRepository {
  private db: D1Database;

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

  /**
   * Get qualification step by order
   * Returns the step with the specified order for type 'qualification'
   */
  async getQualificationStepByOrder(order: number): Promise<TextData | null> {
    console.log(`Getting qualification step by order ${order} from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT * FROM texts 
        WHERE type = ? 
        AND "order" = ?
        AND deleted_at IS NULL
        ORDER BY "order" ASC
        LIMIT 1
      `).bind('qualification', order).first();

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
        console.log(`Qualification step with order ${order} found with DB ID: ${text.id}`);
        return text;
      } else {
        console.log(`Qualification step with order ${order} not found in D1 database`);
        return null;
      }
    } catch (error) {
      console.error(`Error getting qualification step by order ${order}:`, error);
      throw error;
    }
  }

  /**
   * Get total count of qualification steps
   */
  async getQualificationStepsCount(): Promise<number> {
    console.log(`Getting total count of qualification steps from D1 database`);

    try {
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count FROM texts 
        WHERE type = ? 
        AND deleted_at IS NULL
      `).bind('qualification').first();

      if (result && result.count !== undefined) {
        const count = result.count as number;
        console.log(`Total qualification steps count: ${count}`);
        return count;
      } else {
        console.log(`No qualification steps found`);
        return 0;
      }
    } catch (error) {
      console.error(`Error getting qualification steps count:`, error);
      throw error;
    }
  }
}
