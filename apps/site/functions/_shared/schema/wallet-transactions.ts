import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';

export const walletTransactions = sqliteTable('wallet_transactions', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	uuid: text('uuid'),
	wcaid: text('wcaid').notNull(),
	fullWaid: text('full_waid'),
	targetAid: text('target_aid'),
	amount: numeric('amount').notNull(),
	statusName: text('status_name'),
	order: numeric('order').default('0'),
	xaid: text('xaid'),
	createdAt: text('created_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	updatedAt: text('updated_at').notNull().default("(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))"),
	deletedAt: numeric('deleted_at'),
	dataIn: text('data_in', {
		mode: 'json'
	}),
});

