import type { Pool } from 'pg';
import { PostgresD1Adapter } from './postgres-d1-adapter';

/**
 * PostgreSQL Storage Service (replacement for D1StorageService)
 * Provides the same interface as D1StorageService but uses PostgreSQL
 */
export class PostgresStorageService {
  private pool: Pool;
  private dbAdapter: PostgresD1Adapter;

  constructor(pool: Pool) {
    this.pool = pool;
    this.dbAdapter = new PostgresD1Adapter(pool);
  }

  /**
   * Execute queries and return results as array
   * Same interface as D1StorageService.execute()
   */
  async execute(sql: string, params: any[] = []): Promise<any[]> {
    try {
      const stmt = this.dbAdapter.prepare(sql).bind(...params);
      const result = await stmt.all();
      return result.results || [];
    } catch (error) {
      console.error('Error executing SQL:', error);
      throw error;
    }
  }

  /**
   * Get the D1Database adapter for use with repositories
   */
  getDbAdapter(): PostgresD1Adapter {
    return this.dbAdapter;
  }
}

