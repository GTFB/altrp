import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbFile = process.env.CMS_SQLITE_PATH || join(__dirname, '../../../data/cms.database.sqlite');

// Auto-detect runtime and use appropriate SQLite driver
let db: any;

if (typeof Bun !== 'undefined') {
  // Running in Bun runtime (tests, bun --bun commands)
  const { Database } = await import('bun:sqlite');
  const { drizzle } = await import('drizzle-orm/bun-sqlite');
  const sqlite = new Database(dbFile);
  db = drizzle(sqlite);
} else {
  // Running in Node.js runtime (Next.js without --bun flag)
  const Database = (await import('better-sqlite3')).default;
  const { drizzle } = await import('drizzle-orm/better-sqlite3');
  const sqlite = new Database(dbFile);
  db = drizzle(sqlite);
}

export { db };

