import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core'

export const humans = sqliteTable('humans', {
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
})

