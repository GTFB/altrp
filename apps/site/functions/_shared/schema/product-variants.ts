import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createProductVariantsSqlite = () => sqliteTable('product_variants', {
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

// PostgreSQL schema definition
const createProductVariantsPostgres = () => pgTable('product_variants', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid').notNull(),
	pvaid: varchar('pvaid').notNull(),
	fullPaid: varchar('full_paid').notNull(),
	vendorAid: varchar('vendor_aid'),
	sku: varchar('sku'),
	title: varchar('title'),
	statusName: varchar('status_name'),
	order: pgNumeric('order').default('0'),
	xaid: varchar('xaid'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
	gin: jsonb('gin'),
	fts: jsonb('fts'),
	dataIn: jsonb('data_in'),
	dataOut: jsonb('data_out'),
});

export const productVariants = isPostgres() ? createProductVariantsPostgres() : createProductVariantsSqlite();

