import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createAssetsSqlite = () => sqliteTable('assets', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	aaid: text('aaid').notNull(),
	ownerAid: text('owner_aid'),
	number: text('number'),
	title: text('title'),
	url: text('url'),
	typeName: text('type_name'),
	statusName: text('status_name'),
	version: text('version'),
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
const createAssetsPostgres = () => pgTable('assets', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid').notNull(),
	aaid: varchar('aaid').notNull(),
	ownerAid: varchar('owner_aid'),
	number: varchar('number'),
	title: varchar('title'),
	url: varchar('url'),
	typeName: varchar('type_name'),
	statusName: varchar('status_name'),
	version: varchar('version'),
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

export const assets = isPostgres() ? createAssetsPostgres() : createAssetsSqlite();
