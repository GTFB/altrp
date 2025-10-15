import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: '../../packages/db/app/schema.ts',
	out: '../../migrations/app',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.APP_SQLITE_PATH || '../../data/app.database.sqlite',
	},
});



