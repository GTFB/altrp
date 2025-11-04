import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`texts\` ADD \`content\` text;`)
  await db.run(sql`ALTER TABLE \`text_variants\` ADD \`content\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`texts\` DROP COLUMN \`content\`;`)
  await db.run(sql`ALTER TABLE \`text_variants\` DROP COLUMN \`content\`;`)
}
