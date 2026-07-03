CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text DEFAULT 'Admin' NOT NULL,
	`role` text DEFAULT 'editor' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_idx` ON `admin_users` (`email`);--> statement-breakpoint
CREATE TABLE `authors` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`bio` text DEFAULT '' NOT NULL,
	`role` text DEFAULT 'Editor' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`icon` text DEFAULT 'tag' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_idx` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `clicks` (
	`id` text PRIMARY KEY NOT NULL,
	`coupon_id` text,
	`store_id` text,
	`promo_id` text,
	`post_id` text,
	`path` text DEFAULT '' NOT NULL,
	`referer` text,
	`user_agent_hash` text,
	`country` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`promo_id`) REFERENCES `promos`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `clicks_created_idx` ON `clicks` (`created_at`);--> statement-breakpoint
CREATE INDEX `clicks_coupon_idx` ON `clicks` (`coupon_id`);--> statement-breakpoint
CREATE INDEX `clicks_store_idx` ON `clicks` (`store_id`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`title` text NOT NULL,
	`code` text,
	`type` text DEFAULT 'code' NOT NULL,
	`discount_label` text NOT NULL,
	`discount_value` real,
	`terms` text DEFAULT '' NOT NULL,
	`destination_url` text,
	`starts_at` integer,
	`expires_at` integer,
	`is_verified` integer DEFAULT false NOT NULL,
	`is_exclusive` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`click_count` integer DEFAULT 0 NOT NULL,
	`reveal_count` integer DEFAULT 0 NOT NULL,
	`success_reports` integer DEFAULT 0 NOT NULL,
	`sort_weight` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `coupons_store_idx` ON `coupons` (`store_id`);--> statement-breakpoint
CREATE INDEX `coupons_active_idx` ON `coupons` (`is_active`);--> statement-breakpoint
CREATE INDEX `coupons_expires_idx` ON `coupons` (`expires_at`);--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`source` text DEFAULT 'site' NOT NULL,
	`confirmed_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_email_idx` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `post_stores` (
	`post_id` text NOT NULL,
	`store_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `store_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `post_stores_store_idx` ON `post_stores` (`store_id`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`excerpt` text DEFAULT '' NOT NULL,
	`content_json` text NOT NULL,
	`cover_image_url` text,
	`author_id` text NOT NULL,
	`category_id` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`published_at` integer,
	`reading_minutes` integer DEFAULT 3 NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`og_image_url` text,
	`view_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_idx` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_idx` ON `posts` (`status`);--> statement-breakpoint
CREATE INDEX `posts_published_at_idx` ON `posts` (`published_at`);--> statement-breakpoint
CREATE TABLE `promos` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`placement` text NOT NULL,
	`type` text NOT NULL,
	`payload` text DEFAULT '{}' NOT NULL,
	`targeting_rules` text DEFAULT '{}' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`starts_at` integer,
	`ends_at` integer,
	`priority` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `promos_placement_idx` ON `promos` (`placement`);--> statement-breakpoint
CREATE INDEX `promos_active_idx` ON `promos` (`is_active`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	`site_name` text DEFAULT 'Promopedia' NOT NULL,
	`seo_default_title` text DEFAULT 'Promopedia — Verified deals on AI tools and SaaS' NOT NULL,
	`seo_default_description` text DEFAULT 'Editorial coverage and verified coupon codes for AI tools, SaaS products, and digital services. Updated daily.' NOT NULL,
	`footer_tagline` text DEFAULT 'Verified deals and sharp editorial coverage of AI tools, SaaS products, and digital services. Updated daily.' NOT NULL,
	`disclosure_text` text DEFAULT 'When you buy through some links on Promopedia, we may earn a commission at no extra cost to you. This never influences what we cover or recommend.' NOT NULL,
	`social_links` text DEFAULT '{}' NOT NULL,
	`popup_rules` text DEFAULT '{"popupsEnabled":true,"globalCooldownHours":24,"defaultDelayMs":12000}' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `store_categories` (
	`store_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`store_id`, `category_id`),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `store_categories_category_idx` ON `store_categories` (`category_id`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`tagline` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`logo_url` text,
	`website_url` text NOT NULL,
	`affiliate_base_url` text,
	`rating` real DEFAULT 0 NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`seo_title` text,
	`seo_description` text,
	`og_image_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_slug_idx` ON `stores` (`slug`);--> statement-breakpoint
CREATE INDEX `stores_active_idx` ON `stores` (`is_active`);--> statement-breakpoint
CREATE INDEX `stores_featured_idx` ON `stores` (`is_featured`);