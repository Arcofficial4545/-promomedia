CREATE TABLE `comparisons` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`store_a_id` text NOT NULL,
	`store_b_id` text NOT NULL,
	`intro` text DEFAULT '' NOT NULL,
	`criteria` text DEFAULT '[]' NOT NULL,
	`verdict_a` text DEFAULT '' NOT NULL,
	`verdict_b` text DEFAULT '' NOT NULL,
	`bottom_line` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`store_a_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_b_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `comparisons_slug_idx` ON `comparisons` (`slug`);--> statement-breakpoint
CREATE INDEX `comparisons_status_idx` ON `comparisons` (`status`);--> statement-breakpoint
CREATE INDEX `comparisons_featured_idx` ON `comparisons` (`is_featured`);--> statement-breakpoint
ALTER TABLE `settings` ADD `editor_picks` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `rating_breakdown` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `review_body` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `screenshots` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `cover_image_url` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `starting_price_label` text;