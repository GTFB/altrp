import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createWalletsSqlite = () => sqliteTable('wallets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid'),
	waid: text('waid'),
	fullWaid: text('full_waid'),
	targetAid: text('target_aid'),
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
const createWalletsPostgres = () => pgTable('wallets', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid'),
	waid: varchar('waid'),
	fullWaid: varchar('full_waid'),
	targetAid: varchar('target_aid'),
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

export const wallets = isPostgres() ? createWalletsPostgres() : createWalletsSqlite();

