CREATE TABLE `employees` (
  	`id` integer PRIMARY KEY NOT NULL,
  	`uuid` text NOT NULL,
  	`eaid` text NOT NULL,
  	`full_eaid` text,
  	`haid` text NOT NULL,
  	`email` text,
  	`status_name` text,
  	`is_public` integer DEFAULT false,
  	`order` numeric DEFAULT 0,
  	`xaid` text,
  	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	`deleted_at` numeric,
  	`media_id` text,
  	`gin` text,
  	`fts` text,
  	`data_in` text,
  	`data_out` text
  );

CREATE INDEX `employees_updated_at_idx` ON `employees` (`updated_at`);

CREATE INDEX `employees_created_at_idx` ON `employees` (`created_at`);