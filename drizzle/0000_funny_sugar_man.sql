CREATE TABLE `snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`object_key` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_snapshots_owner_created` ON `snapshots` (`owner_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`dataset_type` text NOT NULL,
	`filename` text NOT NULL,
	`object_key` text NOT NULL,
	`bytes` integer NOT NULL,
	`row_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'stored' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_uploads_owner_created` ON `uploads` (`owner_id`,`created_at`);