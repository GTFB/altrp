import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: '../../packages/db/cms/schema.ts',
	out: '../../migrations/cms',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.CMS_SQLITE_PATH || '../../data/cms.database.sqlite',
	},
});



