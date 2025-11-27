import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createProductsSqlite = () => sqliteTable('products', {
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
const createProductsPostgres = () => pgTable('products', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid').notNull(),
	paid: varchar('paid').notNull(),
	title: varchar('title'),
	category: varchar('category'),
	type: varchar('type'),
	statusName: varchar('status_name'),
	isPublic: boolean('is_public').default(true),
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

export const products = isPostgres() ? createProductsPostgres() : createProductsSqlite();

