import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const wallets = sqliteTable('wallets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid'),
	waid: text('waid'),
	fullWaid: text('full_waid'),
	targetAid: text('target_aid'),
	title: text('title'),
	statusName: text('status_name'),
	order: numeric('order').default('0'),
	xaid: text('xaid'),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	deletedAt: numeric('deleted_at'),
	gin: text('gin'),
	fts: text('fts'),
	dataIn: text('data_in'),
	dataOut: text('data_out'),
});

