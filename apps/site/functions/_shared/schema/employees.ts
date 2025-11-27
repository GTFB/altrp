import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { pgTable, serial, varchar, numeric as pgNumeric, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { isPostgres } from '../utils/db';

// SQLite schema definition
const createEmployeesSqlite = () => sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uuid: text('uuid').notNull(),
  eaid: text('eaid'),
  fullEaid: text('full_eaid'),
  haid: text('haid'),
  position: text('position'),
  department: text('department'),
  salary: numeric('salary'),
  hireDate: text('hire_date'),
  terminationDate: text('termination_date'),
  statusName: text('status_name'),
  email: text('email'),
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
const createEmployeesPostgres = () => pgTable('employees', {
  id: serial('id').primaryKey(),
  uuid: varchar('uuid').notNull(),
  eaid: varchar('eaid'),
  fullEaid: varchar('full_eaid'),
  haid: varchar('haid'),
  position: varchar('position'),
  department: varchar('department'),
  salary: pgNumeric('salary'),
  hireDate: varchar('hire_date'),
  terminationDate: varchar('termination_date'),
  statusName: varchar('status_name'),
  email: varchar('email'),
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

export const employees = isPostgres() ? createEmployeesPostgres() : createEmployeesSqlite();