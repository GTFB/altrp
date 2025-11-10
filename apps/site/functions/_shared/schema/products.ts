import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	paid: text('paid').notNull(),
	title: text('title'),
	category: text('category'),
	type: text('type'),
	statusName: text('status_name'),
	isPublic: integer('is_public', { mode: 'boolean' }).default(true),
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

