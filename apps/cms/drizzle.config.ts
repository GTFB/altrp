import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/db/schema.ts',
	out: '../../migrations/cms',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.CMS_SQLITE_PATH || 'apps/cms/db.sqlite',
	},
});



