/**
 * Node-only Drizzle client over local SQLite (better-sqlite3).
 *
 * App code must import `lib/db/client` (which adds the `server-only` guard);
 * this module exists so CLI scripts (seed, migrate) can reuse the same
 * connection logic outside the Next.js runtime.
 *
 * Swapping to Supabase Postgres later only changes this file + drizzle
 * config — see DATA_LAYER.md.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

function resolveDbPath(): string {
  const url = process.env.DATABASE_URL ?? "file:./data/promopedia.db";
  const filePath = url.startsWith("file:") ? url.slice(5) : url;
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(/*turbopackIgnore: true*/ process.cwd(), filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  return absolute;
}

declare global {
  var __promopediaDb: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  const sqlite = new Database(resolveDbPath());
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

/** Singleton across dev HMR reloads. */
export const db = globalThis.__promopediaDb ?? createDb();
globalThis.__promopediaDb = db;

export type DbClient = typeof db;
