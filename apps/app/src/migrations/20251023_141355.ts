import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`user_roles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_uuid\` text NOT NULL,
  	\`role_uuid\` text NOT NULL,
  	\`order\` numeric DEFAULT 0,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`user_roles_updated_at_idx\` ON \`user_roles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`user_roles_created_at_idx\` ON \`user_roles\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`user_roles_id\` integer REFERENCES user_roles(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_user_roles_id_idx\` ON \`payload_locked_documents_rels\` (\`user_roles_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`user_roles\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`settings_id\` integer,
  	\`taxonomy_id\` integer,
  	\`media_id\` integer,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	\`users_id\` integer,
  	\`journals_id\` integer,
  	\`assets_id\` integer,
  	\`asset_variants_id\` integer,
  	\`bases_id\` integer,
  	\`base_moves_id\` integer,
  	\`base_move_routes_id\` integer,
  	\`contractors_id\` integer,
  	\`deals_id\` integer,
  	\`deal_products_id\` integer,
  	\`echelons_id\` integer,
  	\`echelon_employees_id\` integer,
  	\`employee_leaves_id\` integer,
  	\`employee_timesheets_id\` integer,
  	\`expanses_id\` integer,
  	\`finances_id\` integer,
  	\`goals_id\` integer,
  	\`humans_id\` integer,
  	\`identities_id\` integer,
  	\`journal_connections_id\` integer,
  	\`journal_generations_id\` integer,
  	\`journal_system_id\` integer,
  	\`keys_id\` integer,
  	\`locations_id\` integer,
  	\`messages_id\` integer,
  	\`message_threads_id\` integer,
  	\`notices_id\` integer,
  	\`outreaches_id\` integer,
  	\`outreach_referrals_id\` integer,
  	\`permissions_id\` integer,
  	\`products_id\` integer,
  	\`product_variants_id\` integer,
  	\`qualifications_id\` integer,
  	\`relations_id\` integer,
  	\`roles_id\` integer,
  	\`role_permissions_id\` integer,
  	\`segments_id\` integer,
  	\`texts_id\` integer,
  	\`text_variants_id\` integer,
  	\`universities_id\` integer,
  	\`user_bans_id\` integer,
  	\`user_sessions_id\` integer,
  	\`user_verifications_id\` integer,
  	\`votes_id\` integer,
  	\`wallets_id\` integer,
  	\`wallet_transactions_id\` integer,
  	\`yields_id\` integer,
  	\`zoos_id\` integer,
  	\`redirects_id\` integer,
  	\`forms_id\` integer,
  	\`form_submissions_id\` integer,
  	\`search_id\` integer,
  	\`payload_jobs_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`settings_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`taxonomy_id\`) REFERENCES \`taxonomy\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`journals_id\`) REFERENCES \`journals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`assets_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`asset_variants_id\`) REFERENCES \`asset_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`bases_id\`) REFERENCES \`bases\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`base_moves_id\`) REFERENCES \`base_moves\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`base_move_routes_id\`) REFERENCES \`base_move_routes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`contractors_id\`) REFERENCES \`contractors\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`deals_id\`) REFERENCES \`deals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`deal_products_id\`) REFERENCES \`deal_products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`echelons_id\`) REFERENCES \`echelons\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`echelon_employees_id\`) REFERENCES \`echelon_employees\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`employee_leaves_id\`) REFERENCES \`employee_leaves\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`employee_timesheets_id\`) REFERENCES \`employee_timesheets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`expanses_id\`) REFERENCES \`expanses\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`finances_id\`) REFERENCES \`finances\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`goals_id\`) REFERENCES \`goals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`humans_id\`) REFERENCES \`humans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`identities_id\`) REFERENCES \`identities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`journal_connections_id\`) REFERENCES \`journal_connections\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`journal_generations_id\`) REFERENCES \`journal_generations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`journal_system_id\`) REFERENCES \`journal_system\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`keys_id\`) REFERENCES \`keys\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`locations_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`messages_id\`) REFERENCES \`messages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`message_threads_id\`) REFERENCES \`message_threads\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`notices_id\`) REFERENCES \`notices\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`outreaches_id\`) REFERENCES \`outreaches\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`outreach_referrals_id\`) REFERENCES \`outreach_referrals\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`permissions_id\`) REFERENCES \`permissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`product_variants_id\`) REFERENCES \`product_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`qualifications_id\`) REFERENCES \`qualifications\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`relations_id\`) REFERENCES \`relations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`roles_id\`) REFERENCES \`roles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`role_permissions_id\`) REFERENCES \`role_permissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`segments_id\`) REFERENCES \`segments\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`texts_id\`) REFERENCES \`texts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`text_variants_id\`) REFERENCES \`text_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`universities_id\`) REFERENCES \`universities\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`user_bans_id\`) REFERENCES \`user_bans\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`user_sessions_id\`) REFERENCES \`user_sessions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`user_verifications_id\`) REFERENCES \`user_verifications\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`votes_id\`) REFERENCES \`votes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`wallets_id\`) REFERENCES \`wallets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`wallet_transactions_id\`) REFERENCES \`wallet_transactions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`yields_id\`) REFERENCES \`yields\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`zoos_id\`) REFERENCES \`zoos\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`redirects_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`forms_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`form_submissions_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`search_id\`) REFERENCES \`search\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`payload_jobs_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "settings_id", "taxonomy_id", "media_id", "pages_id", "posts_id", "users_id", "journals_id", "assets_id", "asset_variants_id", "bases_id", "base_moves_id", "base_move_routes_id", "contractors_id", "deals_id", "deal_products_id", "echelons_id", "echelon_employees_id", "employee_leaves_id", "employee_timesheets_id", "expanses_id", "finances_id", "goals_id", "humans_id", "identities_id", "journal_connections_id", "journal_generations_id", "journal_system_id", "keys_id", "locations_id", "messages_id", "message_threads_id", "notices_id", "outreaches_id", "outreach_referrals_id", "permissions_id", "products_id", "product_variants_id", "qualifications_id", "relations_id", "roles_id", "role_permissions_id", "segments_id", "texts_id", "text_variants_id", "universities_id", "user_bans_id", "user_sessions_id", "user_verifications_id", "votes_id", "wallets_id", "wallet_transactions_id", "yields_id", "zoos_id", "redirects_id", "forms_id", "form_submissions_id", "search_id", "payload_jobs_id") SELECT "id", "order", "parent_id", "path", "settings_id", "taxonomy_id", "media_id", "pages_id", "posts_id", "users_id", "journals_id", "assets_id", "asset_variants_id", "bases_id", "base_moves_id", "base_move_routes_id", "contractors_id", "deals_id", "deal_products_id", "echelons_id", "echelon_employees_id", "employee_leaves_id", "employee_timesheets_id", "expanses_id", "finances_id", "goals_id", "humans_id", "identities_id", "journal_connections_id", "journal_generations_id", "journal_system_id", "keys_id", "locations_id", "messages_id", "message_threads_id", "notices_id", "outreaches_id", "outreach_referrals_id", "permissions_id", "products_id", "product_variants_id", "qualifications_id", "relations_id", "roles_id", "role_permissions_id", "segments_id", "texts_id", "text_variants_id", "universities_id", "user_bans_id", "user_sessions_id", "user_verifications_id", "votes_id", "wallets_id", "wallet_transactions_id", "yields_id", "zoos_id", "redirects_id", "forms_id", "form_submissions_id", "search_id", "payload_jobs_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_settings_id_idx\` ON \`payload_locked_documents_rels\` (\`settings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_taxonomy_id_idx\` ON \`payload_locked_documents_rels\` (\`taxonomy_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_journals_id_idx\` ON \`payload_locked_documents_rels\` (\`journals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_assets_id_idx\` ON \`payload_locked_documents_rels\` (\`assets_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_asset_variants_id_idx\` ON \`payload_locked_documents_rels\` (\`asset_variants_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_bases_id_idx\` ON \`payload_locked_documents_rels\` (\`bases_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_base_moves_id_idx\` ON \`payload_locked_documents_rels\` (\`base_moves_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_base_move_routes_id_idx\` ON \`payload_locked_documents_rels\` (\`base_move_routes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_contractors_id_idx\` ON \`payload_locked_documents_rels\` (\`contractors_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_deals_id_idx\` ON \`payload_locked_documents_rels\` (\`deals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_deal_products_id_idx\` ON \`payload_locked_documents_rels\` (\`deal_products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_echelons_id_idx\` ON \`payload_locked_documents_rels\` (\`echelons_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_echelon_employees_id_idx\` ON \`payload_locked_documents_rels\` (\`echelon_employees_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_employee_leaves_id_idx\` ON \`payload_locked_documents_rels\` (\`employee_leaves_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_employee_timesheets_id_idx\` ON \`payload_locked_documents_rels\` (\`employee_timesheets_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_expanses_id_idx\` ON \`payload_locked_documents_rels\` (\`expanses_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_finances_id_idx\` ON \`payload_locked_documents_rels\` (\`finances_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_goals_id_idx\` ON \`payload_locked_documents_rels\` (\`goals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_humans_id_idx\` ON \`payload_locked_documents_rels\` (\`humans_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_identities_id_idx\` ON \`payload_locked_documents_rels\` (\`identities_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_journal_connections_id_idx\` ON \`payload_locked_documents_rels\` (\`journal_connections_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_journal_generations_id_idx\` ON \`payload_locked_documents_rels\` (\`journal_generations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_journal_system_id_idx\` ON \`payload_locked_documents_rels\` (\`journal_system_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`keys_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_locations_id_idx\` ON \`payload_locked_documents_rels\` (\`locations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_messages_id_idx\` ON \`payload_locked_documents_rels\` (\`messages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_message_threads_id_idx\` ON \`payload_locked_documents_rels\` (\`message_threads_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_notices_id_idx\` ON \`payload_locked_documents_rels\` (\`notices_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_outreaches_id_idx\` ON \`payload_locked_documents_rels\` (\`outreaches_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_outreach_referrals_id_idx\` ON \`payload_locked_documents_rels\` (\`outreach_referrals_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_permissions_id_idx\` ON \`payload_locked_documents_rels\` (\`permissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_variants_id_idx\` ON \`payload_locked_documents_rels\` (\`product_variants_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_qualifications_id_idx\` ON \`payload_locked_documents_rels\` (\`qualifications_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_relations_id_idx\` ON \`payload_locked_documents_rels\` (\`relations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_roles_id_idx\` ON \`payload_locked_documents_rels\` (\`roles_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_role_permissions_id_idx\` ON \`payload_locked_documents_rels\` (\`role_permissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_segments_id_idx\` ON \`payload_locked_documents_rels\` (\`segments_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_texts_id_idx\` ON \`payload_locked_documents_rels\` (\`texts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_text_variants_id_idx\` ON \`payload_locked_documents_rels\` (\`text_variants_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_universities_id_idx\` ON \`payload_locked_documents_rels\` (\`universities_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_user_bans_id_idx\` ON \`payload_locked_documents_rels\` (\`user_bans_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_user_sessions_id_idx\` ON \`payload_locked_documents_rels\` (\`user_sessions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_user_verifications_id_idx\` ON \`payload_locked_documents_rels\` (\`user_verifications_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_votes_id_idx\` ON \`payload_locked_documents_rels\` (\`votes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_wallets_id_idx\` ON \`payload_locked_documents_rels\` (\`wallets_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_wallet_transactions_id_idx\` ON \`payload_locked_documents_rels\` (\`wallet_transactions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_yields_id_idx\` ON \`payload_locked_documents_rels\` (\`yields_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_zoos_id_idx\` ON \`payload_locked_documents_rels\` (\`zoos_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_redirects_id_idx\` ON \`payload_locked_documents_rels\` (\`redirects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_forms_id_idx\` ON \`payload_locked_documents_rels\` (\`forms_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_form_submissions_id_idx\` ON \`payload_locked_documents_rels\` (\`form_submissions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_search_id_idx\` ON \`payload_locked_documents_rels\` (\`search_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_payload_jobs_id_idx\` ON \`payload_locked_documents_rels\` (\`payload_jobs_id\`);`)
}
