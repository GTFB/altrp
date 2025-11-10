import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const contractors = sqliteTable('contractors', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	caid: text('caid').notNull(),
	title: text('title').notNull(),
	reg: text('reg'),
	tin: text('tin'),
	statusName: text('status_name'),
	type: text('type'),
	cityName: text('city_name'),
	order: numeric('order').default('0'),
	xaid: text('xaid'),
	mediaId: text('media_id'),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	deletedAt: numeric('deleted_at'),
	gin: text('gin'),
	fts: text('fts'),
	dataIn: text('data_in'),
	dataOut: text('data_out'),
});

