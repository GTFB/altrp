import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createBaseMovesSqlite = () => sqliteTable('base_moves', {
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
const createBaseMovesPostgres = () => pgTable('base_moves', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid').notNull(),
	baid: varchar('baid'),
	fullBaid: varchar('full_baid'),
	fullDaid: varchar('full_daid'),
	number: varchar('number'),
	title: varchar('title'),
	laidFrom: varchar('laid_from'),
	laidTo: varchar('laid_to'),
	cycle: varchar('cycle'),
	statusName: varchar('status_name'),
	order: pgNumeric('order').default('0'),
	xaid: varchar('xaid'),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
	gin: jsonb('gin'),
	fts: jsonb('fts'),
	dataIn: jsonb('data_in'),
	dataOut: jsonb('data_out'),
});

export const baseMoves = isPostgres() ? createBaseMovesPostgres() : createBaseMovesSqlite();

