import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createDealProductsSqlite = () => sqliteTable('deal_products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid'),
	fullDaid: text('full_daid').notNull(),
	fullPaid: text('full_paid').notNull(),
	quantity: numeric('quantity').notNull().default('1'),
	statusName: text('status_name'),
	order: numeric('order').default('0'),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	dataIn: text('data_in', {
		mode: 'json'
	}),
});

// PostgreSQL schema definition
const createDealProductsPostgres = () => pgTable('deal_products', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid'),
	fullDaid: varchar('full_daid').notNull(),
	fullPaid: varchar('full_paid').notNull(),
	quantity: pgNumeric('quantity').notNull().default('1'),
	statusName: varchar('status_name'),
	order: pgNumeric('order').default('0'),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	dataIn: jsonb('data_in'),
});

export const dealProducts = isPostgres() ? createDealProductsPostgres() : createDealProductsSqlite();

