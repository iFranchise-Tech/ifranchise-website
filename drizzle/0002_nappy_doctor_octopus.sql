CREATE TABLE `intake_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `intake_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`ip_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `website_submissions` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`session_id` text NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`resume_key` text,
	`resume_name` text,
	`created_at` text NOT NULL,
	`sheet_status` text DEFAULT 'pending' NOT NULL,
	`synced_at` text,
	`attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `website_submissions_reference_unique` ON `website_submissions` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `website_submissions_session_id_unique` ON `website_submissions` (`session_id`);--> statement-breakpoint
CREATE INDEX `website_submissions_pending` ON `website_submissions` (`sheet_status`,`created_at`);