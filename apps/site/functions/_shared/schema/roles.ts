import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createRolesSqlite = () => sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull(),
  raid: text('raid'),
  title: text('title'),
  name: text('name'),
  description: text('description'),
  isSystem: integer('is_system', { mode: 'boolean' }).default(false),
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
const createRolesPostgres = () => pgTable('roles', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid').notNull(),
  raid: varchar('raid'),
  title: varchar('title'),
  name: varchar('name'),
  description: varchar('description'),
  isSystem: boolean('is_system').default(false),
  order: pgNumeric('order').default('0'),
  xaid: varchar('xaid'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  dataIn: jsonb('data_in'),
});

export const roles = isPostgres() ? createRolesPostgres() : createRolesSqlite();

