CREATE TABLE `cms_events` (
	`id` text PRIMARY KEY NOT NULL,
	`record_id` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`snapshot` text,
	`note` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cms_events_record` ON `cms_events` (`record_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `cms_media` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`scope` text NOT NULL,
	`uploaded_by` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cms_members` (
	`email` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`scopes` text NOT NULL,
	`manager` text,
	`status` text NOT NULL,
	`expires_at` text,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cms_members_user_id_unique` ON `cms_members` (`user_id`);--> statement-breakpoint
CREATE TABLE `cms_records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`slug` text NOT NULL,
	`draft` text NOT NULL,
	`live` text,
	`status` text NOT NULL,
	`intent` text DEFAULT 'publish' NOT NULL,
	`version` integer NOT NULL,
	`updated_by` text NOT NULL,
	`submitted_by` text,
	`updated_at` text NOT NULL,
	`mutation` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `cms_records_kind` ON `cms_records` (`kind`);