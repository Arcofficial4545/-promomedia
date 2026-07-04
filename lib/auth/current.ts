import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken, type SessionPayload } from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/**
 * Server-side admin gate for layouts, pages, and actions.
 * `role: "admin"` restricts to full admins; default allows editors too.
 */
export async function requireAdmin(
  role?: "admin",
): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (role === "admin" && session.role !== "admin") redirect("/admin");
  return session;
}
