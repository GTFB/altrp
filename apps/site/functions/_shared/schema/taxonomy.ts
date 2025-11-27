import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createTaxonomySqlite = () => sqliteTable('taxonomy', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entity: text('entity').notNull(),
  name: text('name').notNull(),
  title: text('title'),
  sortOrder: numeric('sort_order').default('0'),
  createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
  updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
  deletedAt: numeric('deleted_at'),
});

// PostgreSQL schema definition
const createTaxonomyPostgres = () => pgTable('taxonomy', {
  id: serial('id').primaryKey(),
  entity: varchar('entity').notNull(),
  name: varchar('name').notNull(),
  title: varchar('title'),
  sortOrder: pgNumeric('sort_order').default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const taxonomy = isPostgres() ? createTaxonomyPostgres() : createTaxonomySqlite();


