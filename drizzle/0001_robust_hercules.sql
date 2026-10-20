
CREATE TABLE `cms_previews` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`created_by` text NOT NULL,
	`expires_at` text NOT NULL
);
