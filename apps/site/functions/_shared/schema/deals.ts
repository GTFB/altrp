import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createDealsSqlite = () => sqliteTable('deals', {
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

// PostgreSQL schema definition
const createDealsPostgres = () => pgTable('deals', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid').notNull(),
	daid: varchar('daid').notNull(),
	fullDaid: varchar('full_daid'),
	clientAid: varchar('client_aid'),
	title: varchar('title'),
	cycle: varchar('cycle'),
	statusName: varchar('status_name'),
	xaid: varchar('xaid'),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
	gin: jsonb('gin'),
	fts: jsonb('fts'),
	dataIn: jsonb('data_in'),
	dataOut: jsonb('data_out'),
});

export const deals = isPostgres() ? createDealsPostgres() : createDealsSqlite();

