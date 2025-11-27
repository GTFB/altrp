import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, integer as pgInteger, varchar, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createJournalsSqlite = () => sqliteTable('journals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    user_id: integer('user_id'),
    uuid: text('uuid').notNull(),
    details: text('details', { mode: 'json' }).notNull(),
    action: text('action').notNull(),
    xaid: text('xaid'),
    created_at: text('created_at'),
    updated_at: text('updated_at'),
});

// PostgreSQL schema definition
const createJournalsPostgres = () => pgTable('journals', {
    id: serial('id').primaryKey(),
    user_id: pgInteger('user_id'),
    uuid: varchar('uuid').notNull(),
    details: jsonb('details').notNull(),
    action: varchar('action').notNull(),
    xaid: varchar('xaid'),
    created_at: timestamp('created_at'),
    updated_at: timestamp('updated_at'),
});

export const journals = isPostgres() ? createJournalsPostgres() : createJournalsSqlite();

