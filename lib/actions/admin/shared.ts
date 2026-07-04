import "server-only";
import type { z } from "zod";

export type AdminActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string };

export function firstIssue(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Check the form and try again.";
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}

/** SQLite unique-constraint errors → friendly message. */
export function friendlyDbError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (message.includes("UNIQUE constraint failed")) {
    if (message.includes("slug")) return "That slug is already in use.";
    if (message.includes("email")) return "That email already exists.";
    return "A record with those unique values already exists.";
  }
  return "Something went wrong saving. Check the values and try again.";
}
