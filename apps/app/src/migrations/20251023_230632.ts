import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`attribute\` text NOT NULL,
  	\`value\` text,
  	\`type\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_updated_at_idx\` ON \`settings\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`settings_created_at_idx\` ON \`settings\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`taxonomy\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`entity\` text NOT NULL,
  	\`name\` text NOT NULL,
  	\`title\` text,
  	\`sort_order\` numeric DEFAULT 0,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`taxonomy_updated_at_idx\` ON \`taxonomy\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`taxonomy_created_at_idx\` ON \`taxonomy\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`maid\` text,
  	\`title\` text,
  	\`alt_text\` text,
  	\`caption\` text,
  	\`file_name\` text,
  	\`file_path\` text,
  	\`mime_type\` text,
  	\`size_bytes\` numeric,
  	\`is_public\` integer DEFAULT true,
  	\`type\` text,
  	\`uploader_aid\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`data_in\` text,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`pages_hero_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_hero_links_order_idx\` ON \`pages_hero_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_hero_links_parent_id_idx\` ON \`pages_hero_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_links_order_idx\` ON \`pages_blocks_cta_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_links_parent_id_idx\` ON \`pages_blocks_cta_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`rich_text\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`size\` text DEFAULT 'oneThird',
  	\`rich_text\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_columns_order_idx\` ON \`pages_blocks_content_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_columns_parent_id_idx\` ON \`pages_blocks_content_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_order_idx\` ON \`pages_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_parent_id_idx\` ON \`pages_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_path_idx\` ON \`pages_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_media_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_media_block_order_idx\` ON \`pages_blocks_media_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_media_block_parent_id_idx\` ON \`pages_blocks_media_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_media_block_path_idx\` ON \`pages_blocks_media_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_media_block_media_idx\` ON \`pages_blocks_media_block\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_archive\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`intro_content\` text,
  	\`populate_by\` text DEFAULT 'collection',
  	\`relation_to\` text DEFAULT 'posts',
  	\`limit\` numeric DEFAULT 10,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_archive_order_idx\` ON \`pages_blocks_archive\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_archive_parent_id_idx\` ON \`pages_blocks_archive\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_archive_path_idx\` ON \`pages_blocks_archive\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_form_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`form_id\` integer,
  	\`enable_intro\` integer,
  	\`intro_content\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_form_block_order_idx\` ON \`pages_blocks_form_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_form_block_parent_id_idx\` ON \`pages_blocks_form_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_form_block_path_idx\` ON \`pages_blocks_form_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_form_block_form_idx\` ON \`pages_blocks_form_block\` (\`form_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`hero_type\` text DEFAULT 'lowImpact',
  	\`hero_rich_text\` text,
  	\`hero_media_id\` integer,
  	\`meta_title\` text,
  	\`meta_image_id\` integer,
  	\`meta_description\` text,
  	\`published_at\` text,
  	\`slug\` text,
  	\`slug_lock\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_hero_hero_media_idx\` ON \`pages\` (\`hero_media_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_meta_meta_image_idx\` ON \`pages\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_pages_id_idx\` ON \`pages_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_posts_id_idx\` ON \`pages_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_version_hero_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_version_hero_links_order_idx\` ON \`_pages_v_version_hero_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_hero_links_parent_id_idx\` ON \`_pages_v_version_hero_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_links_order_idx\` ON \`_pages_v_blocks_cta_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_links_parent_id_idx\` ON \`_pages_v_blocks_cta_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`rich_text\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_order_idx\` ON \`_pages_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_parent_id_idx\` ON \`_pages_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_path_idx\` ON \`_pages_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`size\` text DEFAULT 'oneThird',
  	\`rich_text\` text,
  	\`enable_link\` integer,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text,
  	\`link_appearance\` text DEFAULT 'default',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_columns_order_idx\` ON \`_pages_v_blocks_content_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_columns_parent_id_idx\` ON \`_pages_v_blocks_content_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_order_idx\` ON \`_pages_v_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_parent_id_idx\` ON \`_pages_v_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_path_idx\` ON \`_pages_v_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_media_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`media_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_media_block_order_idx\` ON \`_pages_v_blocks_media_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_media_block_parent_id_idx\` ON \`_pages_v_blocks_media_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_media_block_path_idx\` ON \`_pages_v_blocks_media_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_media_block_media_idx\` ON \`_pages_v_blocks_media_block\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_archive\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`intro_content\` text,
  	\`populate_by\` text DEFAULT 'collection',
  	\`relation_to\` text DEFAULT 'posts',
  	\`limit\` numeric DEFAULT 10,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_archive_order_idx\` ON \`_pages_v_blocks_archive\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_archive_parent_id_idx\` ON \`_pages_v_blocks_archive\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_archive_path_idx\` ON \`_pages_v_blocks_archive\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_form_block\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`form_id\` integer,
  	\`enable_intro\` integer,
  	\`intro_content\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_form_block_order_idx\` ON \`_pages_v_blocks_form_block\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_form_block_parent_id_idx\` ON \`_pages_v_blocks_form_block\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_form_block_path_idx\` ON \`_pages_v_blocks_form_block\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_form_block_form_idx\` ON \`_pages_v_blocks_form_block\` (\`form_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_hero_type\` text DEFAULT 'lowImpact',
  	\`version_hero_rich_text\` text,
  	\`version_hero_media_id\` integer,
  	\`version_meta_title\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_description\` text,
  	\`version_published_at\` text,
  	\`version_slug\` text,
  	\`version_slug_lock\` integer DEFAULT true,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_hero_version_hero_media_idx\` ON \`_pages_v\` (\`version_hero_media_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_autosave_idx\` ON \`_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_pages_id_idx\` ON \`_pages_v_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_posts_id_idx\` ON \`_pages_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE TABLE \`posts_populated_authors\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_populated_authors_order_idx\` ON \`posts_populated_authors\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`posts_populated_authors_parent_id_idx\` ON \`posts_populated_authors\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`hero_image_id\` integer,
  	\`content\` text,
  	\`meta_title\` text,
  	\`meta_image_id\` integer,
  	\`meta_description\` text,
  	\`published_at\` text,
  	\`slug\` text,
  	\`slug_lock\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_hero_image_idx\` ON \`posts\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_meta_meta_image_idx\` ON \`posts\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`posts__status_idx\` ON \`posts\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`posts_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`posts_rels_order_idx\` ON \`posts_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_parent_idx\` ON \`posts_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_path_idx\` ON \`posts_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_posts_id_idx\` ON \`posts_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`posts_rels_users_id_idx\` ON \`posts_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_version_populated_authors\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_version_populated_authors_order_idx\` ON \`_posts_v_version_populated_authors\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_populated_authors_parent_id_idx\` ON \`_posts_v_version_populated_authors\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_hero_image_id\` integer,
  	\`version_content\` text,
  	\`version_meta_title\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_description\` text,
  	\`version_published_at\` text,
  	\`version_slug\` text,
  	\`version_slug_lock\` integer DEFAULT true,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_parent_idx\` ON \`_posts_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_hero_image_idx\` ON \`_posts_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_meta_version_meta_image_idx\` ON \`_posts_v\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_slug_idx\` ON \`_posts_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_updated_at_idx\` ON \`_posts_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version_created_at_idx\` ON \`_posts_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_version_version__status_idx\` ON \`_posts_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_created_at_idx\` ON \`_posts_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_updated_at_idx\` ON \`_posts_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_latest_idx\` ON \`_posts_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_autosave_idx\` ON \`_posts_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_posts_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_posts_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_order_idx\` ON \`_posts_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_parent_idx\` ON \`_posts_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_path_idx\` ON \`_posts_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_posts_id_idx\` ON \`_posts_v_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`_posts_v_rels_users_id_idx\` ON \`_posts_v_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`human_aid\` text,
  	\`role_uuid\` text,
  	\`password_hash\` text,
  	\`is_active\` integer DEFAULT true,
  	\`last_login_at\` text,
  	\`email_verified_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` text,
  	\`data_in\` text,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`journals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`user_id\` numeric,
  	\`action\` text,
  	\`details\` text,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`journals_updated_at_idx\` ON \`journals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`journals_created_at_idx\` ON \`journals\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`assets\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`aaid\` text NOT NULL,
  	\`owner_aid\` text,
  	\`number\` text,
  	\`title\` text,
  	\`url\` text,
  	\`type_name\` text,
  	\`status_name\` text,
  	\`version\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`assets_updated_at_idx\` ON \`assets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`assets_created_at_idx\` ON \`assets\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`asset_variants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`full_aaid\` text NOT NULL,
  	\`number\` text,
  	\`title\` text,
  	\`media_id\` text,
  	\`version\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`asset_variants_updated_at_idx\` ON \`asset_variants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`asset_variants_created_at_idx\` ON \`asset_variants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`bases\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`baid\` text NOT NULL,
  	\`full_baid\` text,
  	\`number\` text,
  	\`title\` text,
  	\`laid_from\` text,
  	\`laid_to\` text,
  	\`cycle\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`bases_updated_at_idx\` ON \`bases\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`bases_created_at_idx\` ON \`bases\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`base_moves\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`baid\` text,
  	\`full_baid\` text,
  	\`full_daid\` text,
  	\`number\` text,
  	\`title\` text,
  	\`laid_from\` text,
  	\`laid_to\` text,
  	\`cycle\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`base_moves_updated_at_idx\` ON \`base_moves\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`base_moves_created_at_idx\` ON \`base_moves\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`base_move_routes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`full_baid\` text NOT NULL,
  	\`index\` text,
  	\`city\` text,
  	\`laid_id\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`base_move_routes_updated_at_idx\` ON \`base_move_routes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`base_move_routes_created_at_idx\` ON \`base_move_routes\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`contractors\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`caid\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`reg\` text,
  	\`tin\` text,
  	\`status_name\` text,
  	\`type\` text,
  	\`city_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`media_id\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`contractors_updated_at_idx\` ON \`contractors\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`contractors_created_at_idx\` ON \`contractors\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`deals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`daid\` text NOT NULL,
  	\`full_daid\` text,
  	\`client_aid\` text,
  	\`title\` text,
  	\`cycle\` text,
  	\`status_name\` text,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`deals_updated_at_idx\` ON \`deals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`deals_created_at_idx\` ON \`deals\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`deal_products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`full_daid\` text NOT NULL,
  	\`full_paid\` text NOT NULL,
  	\`quantity\` numeric DEFAULT 1 NOT NULL,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`deal_products_updated_at_idx\` ON \`deal_products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`deal_products_created_at_idx\` ON \`deal_products\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`echelons\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`eaid\` text NOT NULL,
  	\`parent_eaid\` text,
  	\`department_id\` text,
  	\`position\` text,
  	\`city_name\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`echelons_updated_at_idx\` ON \`echelons\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`echelons_created_at_idx\` ON \`echelons\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`echelon_employees\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`eaid\` text NOT NULL,
  	\`full_eaid\` text,
  	\`haid\` text NOT NULL,
  	\`email\` text,
  	\`status_name\` text,
  	\`is_public\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`media_id\` text,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`echelon_employees_updated_at_idx\` ON \`echelon_employees\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`echelon_employees_created_at_idx\` ON \`echelon_employees\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`employee_leaves\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`elaid\` text,
  	\`full_eaid\` text,
  	\`type\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`started_at\` text,
  	\`ended_at\` text,
  	\`duration\` numeric,
  	\`data_in\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`employee_leaves_updated_at_idx\` ON \`employee_leaves\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`employee_leaves_created_at_idx\` ON \`employee_leaves\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`employee_timesheets\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`etaid\` text,
  	\`full_eaid\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`started_at\` text,
  	\`ended_at\` text,
  	\`duration\` numeric,
  	\`data_in\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`employee_timesheets_updated_at_idx\` ON \`employee_timesheets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`employee_timesheets_created_at_idx\` ON \`employee_timesheets\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`expanses\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`xaid\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`expanses_updated_at_idx\` ON \`expanses\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`expanses_created_at_idx\` ON \`expanses\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`finances\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`faid\` text NOT NULL,
  	\`full_daid\` text,
  	\`title\` text,
  	\`sum\` numeric,
  	\`currency_id\` text,
  	\`cycle\` text,
  	\`type\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`finances_updated_at_idx\` ON \`finances\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`finances_created_at_idx\` ON \`finances\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`goals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`gaid\` text NOT NULL,
  	\`full_gaid\` text,
  	\`parent_full_gaid\` text,
  	\`title\` text,
  	\`cycle\` text,
  	\`type\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`is_public\` integer DEFAULT true,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`goals_updated_at_idx\` ON \`goals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`goals_created_at_idx\` ON \`goals\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`humans\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`haid\` text NOT NULL,
  	\`full_name\` text NOT NULL,
  	\`birthday\` text,
  	\`email\` text,
  	\`sex\` text,
  	\`status_name\` text,
  	\`type\` text,
  	\`city_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`media_id\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`humans_updated_at_idx\` ON \`humans\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`humans_created_at_idx\` ON \`humans\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`identities\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`iaid\` text NOT NULL,
  	\`entity_aid\` text NOT NULL,
  	\`identity_aid\` text NOT NULL,
  	\`permission\` text,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`identities_updated_at_idx\` ON \`identities\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`identities_created_at_idx\` ON \`identities\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`journal_connections\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`source_user_id\` numeric,
  	\`target_user_id\` numeric,
  	\`relationship_name\` text,
  	\`status\` text,
  	\`details\` text,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`journal_connections_updated_at_idx\` ON \`journal_connections\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`journal_connections_created_at_idx\` ON \`journal_connections\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`journal_generations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`full_maid\` text,
  	\`user_id\` numeric,
  	\`model_name\` text,
  	\`status\` text,
  	\`token_in\` numeric,
  	\`token_out\` numeric,
  	\`total_token\` numeric,
  	\`details\` text,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`journal_generations_updated_at_idx\` ON \`journal_generations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`journal_generations_created_at_idx\` ON \`journal_generations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`journal_system\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`entity_aid\` text,
  	\`user_id\` numeric,
  	\`details\` text,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`journal_system_updated_at_idx\` ON \`journal_system\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`journal_system_created_at_idx\` ON \`journal_system\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`keys\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`kaid\` text NOT NULL,
  	\`key_prefix\` text,
  	\`key_hash\` text NOT NULL,
  	\`title\` text,
  	\`is_active\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`permission_id\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`keys_updated_at_idx\` ON \`keys\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`keys_created_at_idx\` ON \`keys\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`locations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`laid\` text NOT NULL,
  	\`full_laid\` text,
  	\`title\` text,
  	\`city\` text,
  	\`type\` text,
  	\`status_name\` text,
  	\`is_public\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`locations_updated_at_idx\` ON \`locations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`locations_created_at_idx\` ON \`locations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`messages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`maid\` text NOT NULL,
  	\`full_maid\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`messages_updated_at_idx\` ON \`messages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`messages_created_at_idx\` ON \`messages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`message_threads\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`maid\` text NOT NULL,
  	\`parent_maid\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`type\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`message_threads_updated_at_idx\` ON \`message_threads\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`message_threads_created_at_idx\` ON \`message_threads\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`notices\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`naid\` text,
  	\`target_aid\` text,
  	\`title\` text,
  	\`is_read\` integer DEFAULT false,
  	\`type_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`notices_updated_at_idx\` ON \`notices\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`notices_created_at_idx\` ON \`notices\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`outreaches\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`oaid\` text NOT NULL,
  	\`said\` text,
  	\`title\` text,
  	\`strategy_type\` text,
  	\`mechanic_type\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`outreaches_updated_at_idx\` ON \`outreaches\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`outreaches_created_at_idx\` ON \`outreaches\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`outreach_referrals\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`oaid\` text NOT NULL,
  	\`title\` text,
  	\`depth\` numeric DEFAULT 0,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`outreach_referrals_updated_at_idx\` ON \`outreach_referrals\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`outreach_referrals_created_at_idx\` ON \`outreach_referrals\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`permissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`prm_aid\` text,
  	\`action_key\` text NOT NULL,
  	\`title\` text,
  	\`group_name\` text,
  	\`description\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`permissions_updated_at_idx\` ON \`permissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`permissions_created_at_idx\` ON \`permissions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`paid\` text NOT NULL,
  	\`title\` text,
  	\`category\` text,
  	\`type\` text,
  	\`status_name\` text,
  	\`is_public\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`product_variants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text NOT NULL,
  	\`pvaid\` text NOT NULL,
  	\`full_paid\` text NOT NULL,
  	\`vendor_aid\` text,
  	\`sku\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`product_variants_updated_at_idx\` ON \`product_variants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`product_variants_created_at_idx\` ON \`product_variants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`qualifications\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`qaid\` text,
  	\`haid\` text,
  	\`title\` text,
  	\`category\` text,
  	\`type\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`qualifications_updated_at_idx\` ON \`qualifications\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`qualifications_created_at_idx\` ON \`qualifications\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`relations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`source_entity\` text NOT NULL,
  	\`target_entity\` text NOT NULL,
  	\`type\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`relations_updated_at_idx\` ON \`relations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`relations_created_at_idx\` ON \`relations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`roles\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`raid\` text,
  	\`title\` text,
  	\`description\` text,
  	\`is_system\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`roles_updated_at_idx\` ON \`roles\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`roles_created_at_idx\` ON \`roles\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`role_permissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`role_uuid\` text NOT NULL,
  	\`permission_uuid\` text NOT NULL,
  	\`uuid\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`role_permissions_updated_at_idx\` ON \`role_permissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`role_permissions_created_at_idx\` ON \`role_permissions\` (\`created_at\`);`)
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
  await db.run(sql`CREATE TABLE \`segments\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`said\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`segments_updated_at_idx\` ON \`segments\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`segments_created_at_idx\` ON \`segments\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`taid\` text,
  	\`title\` text,
  	\`type\` text,
  	\`status_name\` text,
  	\`is_public\` integer DEFAULT true,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`texts_updated_at_idx\` ON \`texts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`texts_created_at_idx\` ON \`texts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`text_variants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`taid\` text,
  	\`full_taid\` text,
  	\`title\` text,
  	\`type\` text,
  	\`status_name\` text,
  	\`version\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`text_variants_updated_at_idx\` ON \`text_variants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`text_variants_created_at_idx\` ON \`text_variants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`universities\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`uaid\` text,
  	\`parent_uaid\` text,
  	\`full_uaid\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`universities_updated_at_idx\` ON \`universities\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`universities_created_at_idx\` ON \`universities\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`user_bans\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`user_uuid\` text NOT NULL,
  	\`banned_by_aid\` text,
  	\`reason\` text,
  	\`type\` text,
  	\`expires_at\` text,
  	\`revoked_at\` text,
  	\`revoked_by_aid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`data_in\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`user_bans_updated_at_idx\` ON \`user_bans\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`user_bans_created_at_idx\` ON \`user_bans\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`user_sessions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`user_uuid\` text NOT NULL,
  	\`token_hash\` text NOT NULL,
  	\`ip_address\` text,
  	\`user_agent\` text,
  	\`last_active_at\` text,
  	\`expires_at\` text,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`data_in\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`user_sessions_updated_at_idx\` ON \`user_sessions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`user_sessions_created_at_idx\` ON \`user_sessions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`user_verifications\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`user_uuid\` text NOT NULL,
  	\`type\` text,
  	\`token_hash\` text NOT NULL,
  	\`expires_at\` text,
  	\`verified_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`data_in\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`user_verifications_updated_at_idx\` ON \`user_verifications\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`user_verifications_created_at_idx\` ON \`user_verifications\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`votes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`vaid\` text,
  	\`full_vaid\` text,
  	\`haid\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`votes_updated_at_idx\` ON \`votes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`votes_created_at_idx\` ON \`votes\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`wallets\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`waid\` text,
  	\`full_waid\` text,
  	\`target_aid\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`wallets_updated_at_idx\` ON \`wallets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`wallets_created_at_idx\` ON \`wallets\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`wallet_transactions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`wcaid\` text NOT NULL,
  	\`full_waid\` text,
  	\`target_aid\` text,
  	\`amount\` numeric NOT NULL,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`wallet_transactions_updated_at_idx\` ON \`wallet_transactions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`wallet_transactions_created_at_idx\` ON \`wallet_transactions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`yields\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`yaid\` text,
  	\`parent_yaid\` text,
  	\`full_yaid\` text,
  	\`haid\` text,
  	\`title\` text,
  	\`status_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`yields_updated_at_idx\` ON \`yields\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`yields_created_at_idx\` ON \`yields\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`zoos\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`uuid\` text,
  	\`zaid\` text,
  	\`parent_zaid\` text,
  	\`name\` text,
  	\`birthday\` text,
  	\`sex\` text,
  	\`status_name\` text,
  	\`city_name\` text,
  	\`order\` numeric DEFAULT 0,
  	\`xaid\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`deleted_at\` numeric,
  	\`media_id\` text,
  	\`gin\` text,
  	\`fts\` text,
  	\`data_in\` text,
  	\`data_out\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`zoos_updated_at_idx\` ON \`zoos\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`zoos_created_at_idx\` ON \`zoos\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`redirects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`from\` text NOT NULL,
  	\`to_type\` text DEFAULT 'reference',
  	\`to_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`redirects_from_idx\` ON \`redirects\` (\`from\`);`)
  await db.run(sql`CREATE INDEX \`redirects_updated_at_idx\` ON \`redirects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`redirects_created_at_idx\` ON \`redirects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`redirects_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`redirects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`redirects_rels_order_idx\` ON \`redirects_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_parent_idx\` ON \`redirects_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_path_idx\` ON \`redirects_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_pages_id_idx\` ON \`redirects_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`redirects_rels_posts_id_idx\` ON \`redirects_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_checkbox\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`required\` integer,
  	\`default_value\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_checkbox_order_idx\` ON \`forms_blocks_checkbox\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_checkbox_parent_id_idx\` ON \`forms_blocks_checkbox\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_checkbox_path_idx\` ON \`forms_blocks_checkbox\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_country\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_country_order_idx\` ON \`forms_blocks_country\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_country_parent_id_idx\` ON \`forms_blocks_country\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_country_path_idx\` ON \`forms_blocks_country\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_email\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_email_order_idx\` ON \`forms_blocks_email\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_email_parent_id_idx\` ON \`forms_blocks_email\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_email_path_idx\` ON \`forms_blocks_email\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_message\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`message\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_message_order_idx\` ON \`forms_blocks_message\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_message_parent_id_idx\` ON \`forms_blocks_message\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_message_path_idx\` ON \`forms_blocks_message\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_number\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`default_value\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_number_order_idx\` ON \`forms_blocks_number\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_number_parent_id_idx\` ON \`forms_blocks_number\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_number_path_idx\` ON \`forms_blocks_number\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_select_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms_blocks_select\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_select_options_order_idx\` ON \`forms_blocks_select_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_select_options_parent_id_idx\` ON \`forms_blocks_select_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_select\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`default_value\` text,
  	\`placeholder\` text,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_select_order_idx\` ON \`forms_blocks_select\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_select_parent_id_idx\` ON \`forms_blocks_select\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_select_path_idx\` ON \`forms_blocks_select\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_state\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_state_order_idx\` ON \`forms_blocks_state\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_state_parent_id_idx\` ON \`forms_blocks_state\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_state_path_idx\` ON \`forms_blocks_state\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`default_value\` text,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_text_order_idx\` ON \`forms_blocks_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_text_parent_id_idx\` ON \`forms_blocks_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_text_path_idx\` ON \`forms_blocks_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_blocks_textarea\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`label\` text,
  	\`width\` numeric,
  	\`default_value\` text,
  	\`required\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_blocks_textarea_order_idx\` ON \`forms_blocks_textarea\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_textarea_parent_id_idx\` ON \`forms_blocks_textarea\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`forms_blocks_textarea_path_idx\` ON \`forms_blocks_textarea\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`forms_emails\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`email_to\` text,
  	\`cc\` text,
  	\`bcc\` text,
  	\`reply_to\` text,
  	\`email_from\` text,
  	\`subject\` text DEFAULT 'You''ve received a new message.' NOT NULL,
  	\`message\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_emails_order_idx\` ON \`forms_emails\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`forms_emails_parent_id_idx\` ON \`forms_emails\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`forms\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`submit_button_label\` text,
  	\`confirmation_type\` text DEFAULT 'message',
  	\`confirmation_message\` text,
  	\`redirect_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`forms_updated_at_idx\` ON \`forms\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`forms_created_at_idx\` ON \`forms\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`form_submissions_submission_data\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`field\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`form_submissions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`form_submissions_submission_data_order_idx\` ON \`form_submissions_submission_data\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_submission_data_parent_id_idx\` ON \`form_submissions_submission_data\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`form_submissions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`form_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`form_id\`) REFERENCES \`forms\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`form_submissions_form_idx\` ON \`form_submissions\` (\`form_id\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_updated_at_idx\` ON \`form_submissions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`form_submissions_created_at_idx\` ON \`form_submissions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`search_categories\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`relation_to\` text,
  	\`category_i_d\` text,
  	\`title\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`search\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`search_categories_order_idx\` ON \`search_categories\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`search_categories_parent_id_idx\` ON \`search_categories\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`search\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`priority\` numeric,
  	\`slug\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`search_slug_idx\` ON \`search\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`search_meta_meta_image_idx\` ON \`search\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`search_updated_at_idx\` ON \`search\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`search_created_at_idx\` ON \`search\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`search_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`search\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`search_rels_order_idx\` ON \`search_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_parent_idx\` ON \`search_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_path_idx\` ON \`search_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`search_rels_posts_id_idx\` ON \`search_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs_log\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`executed_at\` text NOT NULL,
  	\`completed_at\` text NOT NULL,
  	\`task_slug\` text NOT NULL,
  	\`task_i_d\` text NOT NULL,
  	\`input\` text,
  	\`output\` text,
  	\`state\` text NOT NULL,
  	\`error\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`payload_jobs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_order_idx\` ON \`payload_jobs_log\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_log_parent_id_idx\` ON \`payload_jobs_log\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_jobs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`input\` text,
  	\`completed_at\` text,
  	\`total_tried\` numeric DEFAULT 0,
  	\`has_error\` integer DEFAULT false,
  	\`error\` text,
  	\`task_slug\` text,
  	\`queue\` text DEFAULT 'default',
  	\`wait_until\` text,
  	\`processing\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_jobs_completed_at_idx\` ON \`payload_jobs\` (\`completed_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_total_tried_idx\` ON \`payload_jobs\` (\`total_tried\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_has_error_idx\` ON \`payload_jobs\` (\`has_error\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_task_slug_idx\` ON \`payload_jobs\` (\`task_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_queue_idx\` ON \`payload_jobs\` (\`queue\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_wait_until_idx\` ON \`payload_jobs\` (\`wait_until\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_processing_idx\` ON \`payload_jobs\` (\`processing\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_updated_at_idx\` ON \`payload_jobs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_jobs_created_at_idx\` ON \`payload_jobs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
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
  	\`user_roles_id\` integer,
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
  	FOREIGN KEY (\`user_roles_id\`) REFERENCES \`user_roles\`(\`id\`) ON UPDATE no action ON DELETE cascade,
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
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_user_roles_id_idx\` ON \`payload_locked_documents_rels\` (\`user_roles_id\`);`)
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
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`header_nav_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_nav_items_order_idx\` ON \`header_nav_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`header_nav_items_parent_id_idx\` ON \`header_nav_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`header\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`header_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`header_rels_order_idx\` ON \`header_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`header_rels_parent_idx\` ON \`header_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`header_rels_path_idx\` ON \`header_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`header_rels_pages_id_idx\` ON \`header_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`header_rels_posts_id_idx\` ON \`header_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE TABLE \`footer_nav_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link_type\` text DEFAULT 'reference',
  	\`link_new_tab\` integer,
  	\`link_url\` text,
  	\`link_label\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_nav_items_order_idx\` ON \`footer_nav_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`footer_nav_items_parent_id_idx\` ON \`footer_nav_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`footer_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`posts_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`footer_rels_order_idx\` ON \`footer_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`footer_rels_parent_idx\` ON \`footer_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_rels_path_idx\` ON \`footer_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`footer_rels_pages_id_idx\` ON \`footer_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`footer_rels_posts_id_idx\` ON \`footer_rels\` (\`posts_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`settings\`;`)
  await db.run(sql`DROP TABLE \`taxonomy\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`pages_hero_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_links\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_columns\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_media_block\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_archive\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_form_block\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_hero_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_links\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_columns\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_media_block\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_archive\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_form_block\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`posts_populated_authors\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`posts_rels\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_version_populated_authors\`;`)
  await db.run(sql`DROP TABLE \`_posts_v\`;`)
  await db.run(sql`DROP TABLE \`_posts_v_rels\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`journals\`;`)
  await db.run(sql`DROP TABLE \`assets\`;`)
  await db.run(sql`DROP TABLE \`asset_variants\`;`)
  await db.run(sql`DROP TABLE \`bases\`;`)
  await db.run(sql`DROP TABLE \`base_moves\`;`)
  await db.run(sql`DROP TABLE \`base_move_routes\`;`)
  await db.run(sql`DROP TABLE \`contractors\`;`)
  await db.run(sql`DROP TABLE \`deals\`;`)
  await db.run(sql`DROP TABLE \`deal_products\`;`)
  await db.run(sql`DROP TABLE \`echelons\`;`)
  await db.run(sql`DROP TABLE \`echelon_employees\`;`)
  await db.run(sql`DROP TABLE \`employee_leaves\`;`)
  await db.run(sql`DROP TABLE \`employee_timesheets\`;`)
  await db.run(sql`DROP TABLE \`expanses\`;`)
  await db.run(sql`DROP TABLE \`finances\`;`)
  await db.run(sql`DROP TABLE \`goals\`;`)
  await db.run(sql`DROP TABLE \`humans\`;`)
  await db.run(sql`DROP TABLE \`identities\`;`)
  await db.run(sql`DROP TABLE \`journal_connections\`;`)
  await db.run(sql`DROP TABLE \`journal_generations\`;`)
  await db.run(sql`DROP TABLE \`journal_system\`;`)
  await db.run(sql`DROP TABLE \`keys\`;`)
  await db.run(sql`DROP TABLE \`locations\`;`)
  await db.run(sql`DROP TABLE \`messages\`;`)
  await db.run(sql`DROP TABLE \`message_threads\`;`)
  await db.run(sql`DROP TABLE \`notices\`;`)
  await db.run(sql`DROP TABLE \`outreaches\`;`)
  await db.run(sql`DROP TABLE \`outreach_referrals\`;`)
  await db.run(sql`DROP TABLE \`permissions\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`DROP TABLE \`product_variants\`;`)
  await db.run(sql`DROP TABLE \`qualifications\`;`)
  await db.run(sql`DROP TABLE \`relations\`;`)
  await db.run(sql`DROP TABLE \`roles\`;`)
  await db.run(sql`DROP TABLE \`role_permissions\`;`)
  await db.run(sql`DROP TABLE \`user_roles\`;`)
  await db.run(sql`DROP TABLE \`segments\`;`)
  await db.run(sql`DROP TABLE \`texts\`;`)
  await db.run(sql`DROP TABLE \`text_variants\`;`)
  await db.run(sql`DROP TABLE \`universities\`;`)
  await db.run(sql`DROP TABLE \`user_bans\`;`)
  await db.run(sql`DROP TABLE \`user_sessions\`;`)
  await db.run(sql`DROP TABLE \`user_verifications\`;`)
  await db.run(sql`DROP TABLE \`votes\`;`)
  await db.run(sql`DROP TABLE \`wallets\`;`)
  await db.run(sql`DROP TABLE \`wallet_transactions\`;`)
  await db.run(sql`DROP TABLE \`yields\`;`)
  await db.run(sql`DROP TABLE \`zoos\`;`)
  await db.run(sql`DROP TABLE \`redirects\`;`)
  await db.run(sql`DROP TABLE \`redirects_rels\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_checkbox\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_country\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_email\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_message\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_number\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_select_options\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_select\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_state\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_text\`;`)
  await db.run(sql`DROP TABLE \`forms_blocks_textarea\`;`)
  await db.run(sql`DROP TABLE \`forms_emails\`;`)
  await db.run(sql`DROP TABLE \`forms\`;`)
  await db.run(sql`DROP TABLE \`form_submissions_submission_data\`;`)
  await db.run(sql`DROP TABLE \`form_submissions\`;`)
  await db.run(sql`DROP TABLE \`search_categories\`;`)
  await db.run(sql`DROP TABLE \`search\`;`)
  await db.run(sql`DROP TABLE \`search_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs_log\`;`)
  await db.run(sql`DROP TABLE \`payload_jobs\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`header_nav_items\`;`)
  await db.run(sql`DROP TABLE \`header\`;`)
  await db.run(sql`DROP TABLE \`header_rels\`;`)
  await db.run(sql`DROP TABLE \`footer_nav_items\`;`)
  await db.run(sql`DROP TABLE \`footer\`;`)
  await db.run(sql`DROP TABLE \`footer_rels\`;`)
}
