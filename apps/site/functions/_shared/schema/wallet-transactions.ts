import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createWalletTransactionsSqlite = () => sqliteTable('wallet_transactions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid'),
	wcaid: text('wcaid').notNull(),
	fullWaid: text('full_waid'),
	targetAid: text('target_aid'),
	amount: numeric('amount').notNull(),
	statusName: text('status_name'),
	order: numeric('order').default('0'),
	xaid: text('xaid'),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	deletedAt: numeric('deleted_at'),
	dataIn: text('data_in', {
		mode: 'json'
	}),
});

// PostgreSQL schema definition
const createWalletTransactionsPostgres = () => pgTable('wallet_transactions', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid'),
	wcaid: varchar('wcaid').notNull(),
	fullWaid: varchar('full_waid'),
	targetAid: varchar('target_aid'),
	amount: pgNumeric('amount').notNull(),
	statusName: varchar('status_name'),
	order: pgNumeric('order').default('0'),
	xaid: varchar('xaid'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
	dataIn: jsonb('data_in'),
});

export const walletTransactions = isPostgres() ? createWalletTransactionsPostgres() : createWalletTransactionsSqlite();

