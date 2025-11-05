import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
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
  dataIn: text('data_in'),
})

