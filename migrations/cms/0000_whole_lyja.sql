CREATE TABLE `authors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`avatar` text,
	`bio` text,
	`content_markdown` text
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`date` text,
	`excerpt` text,
	`content_markdown` text,
	`tags_json` text
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` text,
	`url` text NOT NULL,
	`alt` text,
	`type` text,
	`size` integer,
	`width` integer,
	`height` integer,
	`duration` integer,
	`content_markdown` text,
	`tags_json` text
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` text,
	`excerpt` text,
	`content_markdown` text,
	`tags_json` text,
	`media` text,
	`seo_title` text,
	`seo_description` text,
	`seo_keywords` text
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` text,
	`excerpt` text,
	`content_markdown` text,
	`tags_json` text,
	`category` text,
	`author` text,
	`media` text,
	`seo_title` text,
	`seo_description` text,
	`seo_keywords` text
);
