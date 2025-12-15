import type { D1Database } from '@cloudflare/workers-types';
import type { PostgresD1Adapter } from '../nodejs/postgres-d1-adapter';

/**
 * Common environment interface for both Worker and Node.js versions
 * DB can be either D1Database (for Cloudflare Workers) or PostgresD1Adapter (for Node.js)
 */
export interface Env {
  DB: D1Database | PostgresD1Adapter;
  BOT_TOKEN: string;
  BOT_TYPE?: string;
  NODE_ENV?: string;
  LOCALE?: string;
  AI_API_URL?: string;
  AI_API_TOKEN?: string;
}

