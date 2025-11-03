import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core'

export const taxonomy = sqliteTable('taxonomy', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entity: text('entity').notNull(),
  name: text('name').notNull(),
  title: text('title'),
  sortOrder: numeric('sort_order').default('0'),
  createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
  updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
  deletedAt: numeric('deleted_at'),
})


