import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, integer as pgInteger, timestamp } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createUserRolesSqlite = () => sqliteTable('user_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userUuid: text('user_uuid').notNull(),
  roleUuid: text('role_uuid').notNull(),
  order: integer('order').default(0),
  createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
});

// PostgreSQL schema definition
const createUserRolesPostgres = () => pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userUuid: varchar('user_uuid').notNull(),
  roleUuid: varchar('role_uuid').notNull(),
  order: pgInteger('order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userRoles = isPostgres() ? createUserRolesPostgres() : createUserRolesSqlite();

