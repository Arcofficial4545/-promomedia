CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text DEFAULT 'Admin' NOT NULL,
	"role" text DEFAULT 'editor' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authors" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"bio" text DEFAULT '' NOT NULL,
	"role" text DEFAULT 'Editor' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT 'tag' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text,
	"store_id" text,
	"promo_id" text,
	"post_id" text,
	"path" text DEFAULT '' NOT NULL,
	"referer" text,
	"user_agent_hash" text,
	"country" text,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "code_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"coupon_id" text NOT NULL,
	"worked" boolean DEFAULT false NOT NULL,
	"visitor_hash" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comparisons" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"store_a_id" text NOT NULL,
	"store_b_id" text NOT NULL,
	"intro" text DEFAULT '' NOT NULL,
	"criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"verdict_a" text DEFAULT '' NOT NULL,
	"verdict_b" text DEFAULT '' NOT NULL,
	"bottom_line" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"title" text NOT NULL,
	"code" text,
	"type" text DEFAULT 'code' NOT NULL,
	"discount_label" text NOT NULL,
	"discount_value" real,
	"terms" text DEFAULT '' NOT NULL,
	"destination_url" text,
	"starts_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_exclusive" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"source_type" text DEFAULT 'official' NOT NULL,
	"last_verified_at" timestamp with time zone,
	"works_count" integer DEFAULT 0 NOT NULL,
	"fails_count" integer DEFAULT 0 NOT NULL,
	"click_count" integer DEFAULT 0 NOT NULL,
	"reveal_count" integer DEFAULT 0 NOT NULL,
	"success_reports" integer DEFAULT 0 NOT NULL,
	"sort_weight" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"source" text DEFAULT 'site' NOT NULL,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_stores" (
	"post_id" text NOT NULL,
	"store_id" text NOT NULL,
	CONSTRAINT "post_stores_post_id_store_id_pk" PRIMARY KEY("post_id","store_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text DEFAULT '' NOT NULL,
	"content_json" jsonb NOT NULL,
	"cover_image_url" text,
	"author_id" text NOT NULL,
	"category_id" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"reading_minutes" integer DEFAULT 3 NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"og_image_url" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "promos" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"placement" text NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"targeting_rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"site_name" text DEFAULT 'Promopedia' NOT NULL,
	"seo_default_title" text DEFAULT 'Promopedia — Verified deals on AI tools and SaaS' NOT NULL,
	"seo_default_description" text DEFAULT 'Editorial coverage and verified coupon codes for AI tools, SaaS products, and digital services. Updated daily.' NOT NULL,
	"footer_tagline" text DEFAULT 'Verified deals and sharp editorial coverage of AI tools, SaaS products, and digital services. Updated daily.' NOT NULL,
	"disclosure_text" text DEFAULT 'When you buy through some links on Promopedia, we may earn a commission at no extra cost to you. This never influences what we cover or recommend.' NOT NULL,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"popup_rules" jsonb DEFAULT '{"popupsEnabled":true,"globalCooldownHours":24,"defaultDelayMs":12000}'::jsonb NOT NULL,
	"editor_picks" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_categories" (
	"store_id" text NOT NULL,
	"category_id" text NOT NULL,
	CONSTRAINT "store_categories_store_id_category_id_pk" PRIMARY KEY("store_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"logo_url" text,
	"website_url" text NOT NULL,
	"affiliate_base_url" text,
	"rating" real DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"seo_title" text,
	"seo_description" text,
	"og_image_url" text,
	"is_fictional" boolean DEFAULT false NOT NULL,
	"hero_summary" text,
	"verdict" text,
	"editorial_score" real,
	"use_it_for" text,
	"skip_it_if" text,
	"good_points" jsonb,
	"weak_points" jsonb,
	"pricing_summary" jsonb,
	"pricing_url" text,
	"how_to_redeem" jsonb,
	"faq" jsonb,
	"alternative_slugs" jsonb,
	"last_reviewed_at" timestamp with time zone,
	"rating_breakdown" jsonb,
	"review_body" jsonb,
	"screenshots" jsonb,
	"cover_image_url" text,
	"starting_price_label" text,
	"theme_color" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_promo_id_promos_id_fk" FOREIGN KEY ("promo_id") REFERENCES "public"."promos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "code_feedback" ADD CONSTRAINT "code_feedback_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_store_a_id_stores_id_fk" FOREIGN KEY ("store_a_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comparisons" ADD CONSTRAINT "comparisons_store_b_id_stores_id_fk" FOREIGN KEY ("store_b_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_stores" ADD CONSTRAINT "post_stores_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_stores" ADD CONSTRAINT "post_stores_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_store_id_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "store_categories" ADD CONSTRAINT "store_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "clicks_created_idx" ON "clicks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "clicks_coupon_idx" ON "clicks" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "clicks_store_idx" ON "clicks" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "code_feedback_coupon_idx" ON "code_feedback" USING btree ("coupon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "code_feedback_dedupe_idx" ON "code_feedback" USING btree ("coupon_id","visitor_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "comparisons_slug_idx" ON "comparisons" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "comparisons_status_idx" ON "comparisons" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comparisons_featured_idx" ON "comparisons" USING btree ("is_featured");--> statement-breakpoint
CREATE INDEX "contact_messages_created_idx" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "coupons_store_idx" ON "coupons" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "coupons_active_idx" ON "coupons" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "coupons_expires_idx" ON "coupons" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "post_stores_store_idx" ON "post_stores" USING btree ("store_id");--> statement-breakpoint
CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_status_idx" ON "posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "posts_published_at_idx" ON "posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "promos_placement_idx" ON "promos" USING btree ("placement");--> statement-breakpoint
CREATE INDEX "promos_active_idx" ON "promos" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "store_categories_category_idx" ON "store_categories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "stores_slug_idx" ON "stores" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "stores_active_idx" ON "stores" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "stores_featured_idx" ON "stores" USING btree ("is_featured");