
CREATE TABLE `cms_previews` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`created_by` text NOT NULL,
	`expires_at` text NOT NULL
);

--> statement-breakpoint
UPDATE cms_events SET record_id='faqs:general' WHERE record_id='pages:faqs';
--> statement-breakpoint
UPDATE cms_records SET id='faqs:general',kind='faqs',slug='general',draft=json_set(draft,'$.slug','general'),live=CASE WHEN live IS NULL THEN NULL ELSE json_set(live,'$.slug','general') END WHERE id='pages:faqs';
