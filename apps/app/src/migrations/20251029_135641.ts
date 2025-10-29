import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`keys\` ADD \`is_valid\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`message_threads\` ADD \`value\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`keys\` DROP COLUMN \`is_valid\`;`)
  await db.run(sql`ALTER TABLE \`message_threads\` DROP COLUMN \`value\`;`)
}
