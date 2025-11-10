import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const baseMoves = sqliteTable('base_moves', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	baid: text('baid'),
	fullBaid: text('full_baid'),
	fullDaid: text('full_daid'),
	number: text('number'),
	title: text('title'),
	laidFrom: text('laid_from'),
	laidTo: text('laid_to'),
	cycle: text('cycle'),
	statusName: text('status_name'),
	order: numeric('order').default('0'),
	xaid: text('xaid'),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	deletedAt: numeric('deleted_at'),
	gin: text('gin'),
	fts: text('fts'),
	dataIn: text('data_in'),
	dataOut: text('data_out'),
});

