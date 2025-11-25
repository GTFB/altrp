import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const assets = sqliteTable('assets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	aaid: text('aaid').notNull(),
	ownerAid: text('owner_aid'),
	number: text('number'),
	title: text('title'),
	url: text('url'),
	typeName: text('type_name'),
	statusName: text('status_name'),
	version: text('version'),
	order: numeric('order').default('0'),
	xaid: text('xaid'),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
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

