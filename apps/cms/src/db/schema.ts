import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const posts = sqliteTable('posts', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull(),
	locale: text('locale').notNull().default('en'),
	title: text('title').notNull(),
	description: text('description'),
	date: text('date'),
	excerpt: text('excerpt'),
	contentMarkdown: text('content_markdown'),
	tagsJson: text('tags_json'),
	category: text('category'),
	author: text('author'),
	media: text('media'),
	seoTitle: text('seo_title'),
	seoDescription: text('seo_description'),
	seoKeywords: text('seo_keywords'),
});

export const pages = sqliteTable('pages', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	date: text('date'),
	excerpt: text('excerpt'),
	contentMarkdown: text('content_markdown'),
	tagsJson: text('tags_json'),
	media: text('media'),
	seoTitle: text('seo_title'),
	seoDescription: text('seo_description'),
	seoKeywords: text('seo_keywords'),
});

export const categories = sqliteTable('categories', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull(),
	title: text('title').notNull(),
	date: text('date'),
	excerpt: text('excerpt'),
	contentMarkdown: text('content_markdown'),
	tagsJson: text('tags_json'),
});

export const authors = sqliteTable('authors', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull(),
	name: text('name').notNull(),
	avatar: text('avatar'),
	bio: text('bio'),
	contentMarkdown: text('content_markdown'),
});

export const media = sqliteTable('media', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	slug: text('slug').notNull(),
	title: text('title').notNull(),
	description: text('description'),
	date: text('date'),
	url: text('url').notNull(),
	alt: text('alt'),
	type: text('type'),
	size: integer('size'),
	width: integer('width'),
	height: integer('height'),
	duration: integer('duration'),
	contentMarkdown: text('content_markdown'),
	tagsJson: text('tags_json'),
});


