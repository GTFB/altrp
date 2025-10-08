import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbFile = process.env.CMS_SQLITE_PATH || join(__dirname, '../../../../packages/db/cms.database.sqlite');

const sqlite = new Database(dbFile);
export const db = drizzle(sqlite);



