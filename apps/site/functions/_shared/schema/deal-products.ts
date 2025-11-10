import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const dealProducts = sqliteTable('deal_products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid'),
	fullDaid: text('full_daid').notNull(),
	fullPaid: text('full_paid').notNull(),
	quantity: numeric('quantity').notNull().default('1'),
	statusName: text('status_name'),
	order: numeric('order').default('0'),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	dataIn: text('data_in'),
});

