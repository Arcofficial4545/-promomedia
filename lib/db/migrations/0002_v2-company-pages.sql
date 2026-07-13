CREATE TABLE `code_feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`coupon_id` text NOT NULL,
	`worked` integer DEFAULT false NOT NULL,
	`visitor_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `code_feedback_coupon_idx` ON `code_feedback` (`coupon_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `code_feedback_dedupe_idx` ON `code_feedback` (`coupon_id`,`visitor_hash`);--> statement-breakpoint
ALTER TABLE `coupons` ADD `source_type` text DEFAULT 'official' NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` ADD `last_verified_at` integer;--> statement-breakpoint
ALTER TABLE `coupons` ADD `works_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `coupons` ADD `fails_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `is_fictional` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `hero_summary` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `verdict` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `editorial_score` real;--> statement-breakpoint
ALTER TABLE `stores` ADD `use_it_for` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `skip_it_if` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `good_points` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `weak_points` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `pricing_summary` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `pricing_url` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `how_to_redeem` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `faq` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `alternative_slugs` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `last_reviewed_at` integer;