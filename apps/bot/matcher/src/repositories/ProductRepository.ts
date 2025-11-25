import type { D1Database } from '@cloudflare/workers-types';
import type { PostgresD1Adapter } from '../nodejs/postgres-d1-adapter';
import { generateUuidV4 } from '../helpers/generateUuidV4';
import { generateAid } from '../helpers/generateAid';

export interface ProductData {
  id?: number;
  uuid?: string;
  paid?: string;
  title?: string;
  category?: string;
  type?: string;
  statusName?: string;
  isPublic?: number;
  order?: number;
  xaid?: string;
  dataIn?: string;
  dataOut?: string;
}

export interface ProductRepositoryConfig {
  db: D1Database | PostgresD1Adapter;
}

export class ProductRepository {
  private db: D1Database | PostgresD1Adapter;

  constructor(config: ProductRepositoryConfig) {
    this.db = config.db;
  }

  private mapRow(row: any): ProductData {
    return {
      id: row.id as number,
      uuid: row.uuid as string,
      paid: row.paid as string,
      title: row.title as string | undefined,
      category: row.category as string | undefined,
      type: row.type as string | undefined,
      statusName: row.status_name as string | undefined,
      isPublic: row.is_public as number | undefined,
      order: row.order as number | undefined,
      xaid: row.xaid as string | undefined,
      dataIn: row.data_in as string | undefined,
      dataOut: row.data_out as string | undefined
    };
  }

  async addProduct(product: ProductData): Promise<number> {
    const uuid = product.uuid || generateUuidV4();
    const paid = product.paid || generateAid('p');
    const now = new Date().toISOString();

    const result = await this.db.prepare(`
      INSERT INTO products (
        uuid, paid, title, category, type, status_name,
        is_public, \`order\`, xaid, data_in, data_out,
        created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      uuid,
      paid,
      product.title || null,
      product.category || null,
      product.type || null,
      product.statusName || null,
      product.isPublic ?? 1,
      product.order ?? 0,
      product.xaid || null,
      product.dataIn || null,
      product.dataOut || null,
      now,
      now
    ).run();

    return result.meta.last_row_id as number;
  }

  async searchProductsByQuery(query: string, limit = 5): Promise<ProductData[]> {
    const like = `%${query}%`;

    const result = await this.db.prepare(`
      SELECT *
      FROM products
      WHERE deleted_at IS NULL
        AND (
          title LIKE ?
          OR data_in LIKE ?
        )
      ORDER BY updated_at DESC
      LIMIT ?
    `).bind(like, like, limit).all();

    if (!result || !result.results) {
      return [];
    }

    return (result.results as any[]).map(row => this.mapRow(row));
  }
}


