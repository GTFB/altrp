import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const userRoles = sqliteTable('user_roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userUuid: text('user_uuid').notNull(),
  roleUuid: text('role_uuid').notNull(),
  order: integer('order').default(0),
  createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
})

