import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { settings, type Settings } from "../schema";

const SINGLETON_ID = "singleton";

export async function getSettings(): Promise<Settings> {
  const existing = await db.query.settings.findFirst({
    where: eq(settings.id, SINGLETON_ID),
  });
  if (existing) return existing;
  const [row] = await db
    .insert(settings)
    .values({ id: SINGLETON_ID })
    .returning();
  return row;
}

export async function updateSettings(
  data: Partial<Omit<Settings, "id" | "updatedAt">>,
): Promise<Settings> {
  await getSettings(); // ensure the singleton row exists
  const [row] = await db
    .update(settings)
    .set(data)
    .where(eq(settings.id, SINGLETON_ID))
    .returning();
  return row;
}
