import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const dbFile = process.env.CMS_SQLITE_PATH || 'apps/cms/db.sqlite';

export const sqlite = new Database(dbFile);
export const db = drizzle(sqlite);



