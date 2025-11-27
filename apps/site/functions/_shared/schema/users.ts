import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createUsersSqlite = () => sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull(),
  humanAid: text('human_aid'),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  salt: text('salt').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastLoginAt: text('last_login_at'),
  emailVerifiedAt: text('email_verified_at'),
  createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
  updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
  deletedAt: text('deleted_at'),
  dataIn: text('data_in', {
    mode: 'json'
  }),
});

// PostgreSQL schema definition
const createUsersPostgres = () => pgTable('users', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid').notNull(),
  humanAid: varchar('human_aid'),
  email: varchar('email').notNull(),
  passwordHash: varchar('password_hash').notNull(),
  salt: varchar('salt').notNull(),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  emailVerifiedAt: timestamp('email_verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  dataIn: jsonb('data_in'),
});

export const users = isPostgres() ? createUsersPostgres() : createUsersSqlite();

