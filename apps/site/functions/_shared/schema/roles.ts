import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core'

export const roles = sqliteTable('roles', {
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
})

