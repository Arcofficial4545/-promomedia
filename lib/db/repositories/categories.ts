import "server-only";
import { asc, count, eq } from "drizzle-orm";
import { db } from "../client";
import {
  categories,
  storeCategories,
  type Category,
  type NewCategory,
} from "../schema";

export type CategoryWithCount = Category & { storeCount: number };

export async function listCategories(): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      category: categories,
      storeCount: count(storeCategories.storeId),
    })
    .from(categories)
    .leftJoin(storeCategories, eq(storeCategories.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return rows.map((r) => ({ ...r.category, storeCount: r.storeCount }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const row = await db.query.categories.findFirst({
    where: eq(categories.slug, slug),
  });
  return row ?? null;
}

export async function listAllCategorySlugs(): Promise<string[]> {
  const rows = await db.select({ slug: categories.slug }).from(categories);
  return rows.map((r) => r.slug);
}

/* ------------------------------- Admin ------------------------------- */

export async function createCategory(data: NewCategory): Promise<Category> {
  const [row] = await db.insert(categories).values(data).returning();
  return row;
}

export async function updateCategory(
  id: string,
  data: Partial<NewCategory>,
): Promise<Category | null> {
  const [row] = await db
    .update(categories)
    .set(data)
    .where(eq(categories.id, id))
    .returning();
  return row ?? null;
}

export async function deleteCategory(id: string): Promise<void> {
  await db.delete(categories).where(eq(categories.id, id));
}
