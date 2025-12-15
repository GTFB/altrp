import type { D1Database } from '@cloudflare/workers-types';
import type { PostgresD1Adapter } from '../nodejs/postgres-d1-adapter';

export class D1StorageService {
  private db: D1Database | PostgresD1Adapter;

  constructor(db: D1Database | PostgresD1Adapter) {
    this.db = db;
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
