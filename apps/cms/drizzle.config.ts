import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/db/schema.ts',
	out: '../../migrations/cms',
	driver: 'better-sqlite',
	dbCredentials: {
		url: process.env.CMS_SQLITE_PATH || 'apps/cms/db.sqlite',
	},
});



