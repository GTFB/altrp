import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const productVariants = sqliteTable('product_variants', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	pvaid: text('pvaid').notNull(),
	fullPaid: text('full_paid').notNull(),
	vendorAid: text('vendor_aid'),
	sku: text('sku'),
	title: text('title'),
	statusName: text('status_name'),
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

