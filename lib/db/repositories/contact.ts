import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "../client";
import { contactMessages, type ContactMessage } from "../schema";

export async function createContactMessage(data: {
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  await db.insert(contactMessages).values(data);
}

export async function listContactMessages(): Promise<ContactMessage[]> {
  return db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt));
}

export async function markContactMessageRead(id: string): Promise<void> {
  await db
    .update(contactMessages)
    .set({ isRead: true })
    .where(eq(contactMessages.id, id));
}
