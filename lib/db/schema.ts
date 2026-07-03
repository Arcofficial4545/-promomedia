import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/* ------------------------------------------------------------------ */
/* Shared column helpers                                               */
/* ------------------------------------------------------------------ */

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

const updatedAt = () =>
  integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdateFn(() => new Date());

const bool = (name: string, defaultValue = false) =>
  integer(name, { mode: "boolean" }).notNull().default(defaultValue);

/* ------------------------------------------------------------------ */
/* JSON payload types                                                  */
/* ------------------------------------------------------------------ */

export type PromoPlacement =
  | "sidebar"
  | "sticky-rail"
  | "in-content"
  | "popup-timed"
  | "popup-exit"
  | "home-banner";

export type PromoType = "coupon-highlight" | "custom-card" | "newsletter";

export type PromoPayload = {
  couponId?: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
};

export type PromoTargetingRules = {
  /** Path prefixes the promo may appear on; empty/absent = everywhere. */
  paths?: string[];
  /** Path prefixes the promo must never appear on. */
  excludePaths?: string[];
  /** Max times shown per visitor within `frequencyDays`. */
  frequencyCap?: number;
  frequencyDays?: number;
  /** Delay before a timed popup opens, in ms. */
  delayMs?: number;
};

export type SettingsSocialLinks = {
  x?: string;
  linkedin?: string;
  youtube?: string;
};

export type SettingsPopupRules = {
  /** Global kill-switch for all popup placements. */
  popupsEnabled: boolean;
  /** Minimum hours between any two popups for one visitor. */
  globalCooldownHours: number;
  /** Default delay for timed popups when the promo doesn't set one. */
  defaultDelayMs: number;
};

export type TiptapDoc = {
  type: "doc";
  content?: unknown[];
};

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

export const stores = sqliteTable(
  "stores",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    logoUrl: text("logo_url"),
    websiteUrl: text("website_url").notNull(),
    affiliateBaseUrl: text("affiliate_base_url"),
    rating: real("rating").notNull().default(0),
    isFeatured: bool("is_featured"),
    isActive: bool("is_active", true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("stores_slug_idx").on(t.slug),
    index("stores_active_idx").on(t.isActive),
    index("stores_featured_idx").on(t.isFeatured),
  ],
);

export const categories = sqliteTable(
  "categories",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    /** Lucide icon name, e.g. "bot", "blocks", "calculator". */
    icon: text("icon").notNull().default("tag"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const storeCategories = sqliteTable(
  "store_categories",
  {
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.storeId, t.categoryId] }),
    index("store_categories_category_idx").on(t.categoryId),
  ],
);

export const coupons = sqliteTable(
  "coupons",
  {
    id: id(),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    /** Null for deal-type coupons. */
    code: text("code"),
    type: text("type", { enum: ["code", "deal"] })
      .notNull()
      .default("code"),
    discountLabel: text("discount_label").notNull(),
    discountValue: real("discount_value"),
    terms: text("terms").notNull().default(""),
    /** Overrides the store's affiliate/website URL when set. */
    destinationUrl: text("destination_url"),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }),
    isVerified: bool("is_verified"),
    isExclusive: bool("is_exclusive"),
    isActive: bool("is_active", true),
    clickCount: integer("click_count").notNull().default(0),
    revealCount: integer("reveal_count").notNull().default(0),
    successReports: integer("success_reports").notNull().default(0),
    sortWeight: integer("sort_weight").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("coupons_store_idx").on(t.storeId),
    index("coupons_active_idx").on(t.isActive),
    index("coupons_expires_idx").on(t.expiresAt),
  ],
);

export const authors = sqliteTable("authors", {
  id: id(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  bio: text("bio").notNull().default(""),
  role: text("role").notNull().default("Editor"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const posts = sqliteTable(
  "posts",
  {
    id: id(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    contentJson: text("content_json", { mode: "json" })
      .notNull()
      .$type<TiptapDoc>(),
    coverImageUrl: text("cover_image_url"),
    authorId: text("author_id")
      .notNull()
      .references(() => authors.id),
    categoryId: text("category_id").references(() => categories.id),
    tags: text("tags", { mode: "json" }).notNull().$type<string[]>().default([]),
    status: text("status", { enum: ["draft", "published"] })
      .notNull()
      .default("draft"),
    publishedAt: integer("published_at", { mode: "timestamp_ms" }),
    readingMinutes: integer("reading_minutes").notNull().default(3),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ogImageUrl: text("og_image_url"),
    viewCount: integer("view_count").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("posts_slug_idx").on(t.slug),
    index("posts_status_idx").on(t.status),
    index("posts_published_at_idx").on(t.publishedAt),
  ],
);

export const postStores = sqliteTable(
  "post_stores",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    storeId: text("store_id")
      .notNull()
      .references(() => stores.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.storeId] }),
    index("post_stores_store_idx").on(t.storeId),
  ],
);

export const promos = sqliteTable(
  "promos",
  {
    id: id(),
    name: text("name").notNull(),
    placement: text("placement")
      .notNull()
      .$type<PromoPlacement>(),
    type: text("type").notNull().$type<PromoType>(),
    payload: text("payload", { mode: "json" })
      .notNull()
      .$type<PromoPayload>()
      .default({}),
    targetingRules: text("targeting_rules", { mode: "json" })
      .notNull()
      .$type<PromoTargetingRules>()
      .default({}),
    isActive: bool("is_active", true),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }),
    priority: integer("priority").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("promos_placement_idx").on(t.placement),
    index("promos_active_idx").on(t.isActive),
  ],
);

export const clicks = sqliteTable(
  "clicks",
  {
    id: id(),
    couponId: text("coupon_id").references(() => coupons.id, {
      onDelete: "set null",
    }),
    storeId: text("store_id").references(() => stores.id, {
      onDelete: "set null",
    }),
    promoId: text("promo_id").references(() => promos.id, {
      onDelete: "set null",
    }),
    postId: text("post_id").references(() => posts.id, {
      onDelete: "set null",
    }),
    path: text("path").notNull().default(""),
    referer: text("referer"),
    /** SHA-256 of the user agent — never the raw string. */
    userAgentHash: text("user_agent_hash"),
    country: text("country"),
    createdAt: createdAt(),
  },
  (t) => [
    index("clicks_created_idx").on(t.createdAt),
    index("clicks_coupon_idx").on(t.couponId),
    index("clicks_store_idx").on(t.storeId),
  ],
);

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: id(),
    email: text("email").notNull(),
    source: text("source").notNull().default("site"),
    confirmedAt: integer("confirmed_at", { mode: "timestamp_ms" }),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("newsletter_email_idx").on(t.email)],
);

export const settings = sqliteTable("settings", {
  /** Singleton row — always `"singleton"`. */
  id: text("id").primaryKey().default("singleton"),
  siteName: text("site_name").notNull().default("Promopedia"),
  seoDefaultTitle: text("seo_default_title")
    .notNull()
    .default("Promopedia — Verified deals on AI tools and SaaS"),
  seoDefaultDescription: text("seo_default_description")
    .notNull()
    .default(
      "Editorial coverage and verified coupon codes for AI tools, SaaS products, and digital services. Updated daily.",
    ),
  footerTagline: text("footer_tagline")
    .notNull()
    .default(
      "Verified deals and sharp editorial coverage of AI tools, SaaS products, and digital services. Updated daily.",
    ),
  disclosureText: text("disclosure_text")
    .notNull()
    .default(
      "When you buy through some links on Promopedia, we may earn a commission at no extra cost to you. This never influences what we cover or recommend.",
    ),
  socialLinks: text("social_links", { mode: "json" })
    .notNull()
    .$type<SettingsSocialLinks>()
    .default({}),
  popupRules: text("popup_rules", { mode: "json" })
    .notNull()
    .$type<SettingsPopupRules>()
    .default({
      popupsEnabled: true,
      globalCooldownHours: 24,
      defaultDelayMs: 12_000,
    }),
  updatedAt: updatedAt(),
});

export const contactMessages = sqliteTable(
  "contact_messages",
  {
    id: id(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    message: text("message").notNull(),
    isRead: bool("is_read"),
    createdAt: createdAt(),
  },
  (t) => [index("contact_messages_created_idx").on(t.createdAt)],
);

export const adminUsers = sqliteTable(
  "admin_users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull().default("Admin"),
    role: text("role", { enum: ["admin", "editor"] })
      .notNull()
      .default("editor"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("admin_users_email_idx").on(t.email)],
);

/* ------------------------------------------------------------------ */
/* Relations                                                           */
/* ------------------------------------------------------------------ */

export const storesRelations = relations(stores, ({ many }) => ({
  coupons: many(coupons),
  storeCategories: many(storeCategories),
  postStores: many(postStores),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  storeCategories: many(storeCategories),
  posts: many(posts),
}));

export const storeCategoriesRelations = relations(
  storeCategories,
  ({ one }) => ({
    store: one(stores, {
      fields: [storeCategories.storeId],
      references: [stores.id],
    }),
    category: one(categories, {
      fields: [storeCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const couponsRelations = relations(coupons, ({ one }) => ({
  store: one(stores, {
    fields: [coupons.storeId],
    references: [stores.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  postStores: many(postStores),
}));

export const postStoresRelations = relations(postStores, ({ one }) => ({
  post: one(posts, {
    fields: [postStores.postId],
    references: [posts.id],
  }),
  store: one(stores, {
    fields: [postStores.storeId],
    references: [stores.id],
  }),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  posts: many(posts),
}));

/* ------------------------------------------------------------------ */
/* Row types                                                           */
/* ------------------------------------------------------------------ */

export type Store = typeof stores.$inferSelect;
export type NewStore = typeof stores.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Author = typeof authors.$inferSelect;
export type Promo = typeof promos.$inferSelect;
export type NewPromo = typeof promos.$inferInsert;
export type Click = typeof clicks.$inferSelect;
export type NewClick = typeof clicks.$inferInsert;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
