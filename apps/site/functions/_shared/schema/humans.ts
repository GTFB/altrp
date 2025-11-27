import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createHumansSqlite = () => sqliteTable('humans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull(),
  haid: text('haid').notNull(),
  fullName: text('full_name').notNull(),
  birthday: text('birthday'),
  email: text('email'),
  sex: text('sex'),
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
const createHumansPostgres = () => pgTable('humans', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid').notNull(),
  haid: varchar('haid').notNull(),
  fullName: varchar('full_name').notNull(),
  birthday: varchar('birthday'),
  email: varchar('email'),
  sex: varchar('sex'),
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

export const humans = isPostgres() ? createHumansPostgres() : createHumansSqlite();

