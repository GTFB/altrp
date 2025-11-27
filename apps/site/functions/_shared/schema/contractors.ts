import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createContractorsSqlite = () => sqliteTable('contractors', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	caid: text('caid').notNull(),
	title: text('title').notNull(),
	reg: text('reg'),
	tin: text('tin'),
	statusName: text('status_name'),
	type: text('type'),
	cityName: text('city_name'),
	order: numeric('order').default('0'),
	xaid: text('xaid'),
	mediaId: text('media_id'),
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
const createContractorsPostgres = () => pgTable('contractors', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid').notNull(),
	caid: varchar('caid').notNull(),
	title: varchar('title').notNull(),
	reg: varchar('reg'),
	tin: varchar('tin'),
	statusName: varchar('status_name'),
	type: varchar('type'),
	cityName: varchar('city_name'),
	order: pgNumeric('order').default('0'),
	xaid: varchar('xaid'),
	mediaId: varchar('media_id'),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	deletedAt: timestamp('deleted_at'),
	gin: jsonb('gin'),
	fts: jsonb('fts'),
	dataIn: jsonb('data_in'),
	dataOut: jsonb('data_out'),
});

export const contractors = isPostgres() ? createContractorsPostgres() : createContractorsSqlite();

