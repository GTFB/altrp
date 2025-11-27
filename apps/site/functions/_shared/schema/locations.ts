import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createLocationsSqlite = () => sqliteTable('locations', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid').notNull(),
	laid: text('laid').notNull(),
	fullLaid: text('full_laid'),
	title: text('title'),
	city: text('city'),
	type: text('type'),
	statusName: text('status_name'),
	isPublic: integer('is_public', { mode: 'boolean' }).default(true),
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
const createLocationsPostgres = () => pgTable('locations', {
	id: serial('id').primaryKey(),
	uuid: varchar('uuid').notNull(),
	laid: varchar('laid').notNull(),
	fullLaid: varchar('full_laid'),
	title: varchar('title'),
	city: varchar('city'),
	type: varchar('type'),
	statusName: varchar('status_name'),
	isPublic: boolean('is_public').default(true),
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

export const locations = isPostgres() ? createLocationsPostgres() : createLocationsSqlite();

