import "server-only";
import { eq } from "drizzle-orm";
import { db } from "../client";
import { adminUsers, type AdminUser } from "../schema";

export async function getAdminUserByEmail(
  email: string,
): Promise<AdminUser | null> {
  const row = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.email, email.trim().toLowerCase()),
  });
  return row ?? null;
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  const row = await db.query.adminUsers.findFirst({
    where: eq(adminUsers.id, id),
  });
  return row ?? null;
}
