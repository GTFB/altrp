import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const deals = sqliteTable('deals', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	daid: text('daid').notNull(),
	fullDaid: text('full_daid'),
	clientAid: text('client_aid'),
	title: text('title'),
	cycle: text('cycle'),
	statusName: text('status_name'),
	xaid: text('xaid'),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	deletedAt: numeric('deleted_at'),
	gin: text('gin', {
		mode: 'json'
	}),
	fts: text('fts', {
		mode: 'json'
	}),
	dataIn: text('data_in', {
		mode: 'json'
	}),
	dataOut: text('data_out', {
		mode: 'json'
	}),
});

