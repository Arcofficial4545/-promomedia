/**
 * Drizzle client over libSQL. Works in two modes from one driver:
 *  - Local dev / CLI scripts: a `file:` URL points at the on-disk SQLite file.
 *  - Production (Vercel + Turso): a `libsql://` URL + auth token talks to the
 *    hosted database over HTTP, which is what serverless needs.
 *
 * App code imports `lib/db/client` (adds the `server-only` guard); this module
 * exists so CLI scripts (seed, migrate) can reuse the same connection.
 *
 * Env:
 *  - DATABASE_URL         file:./data/promopedia.db (local) or libsql://... (Turso)
 *  - DATABASE_AUTH_TOKEN  required for a remote libsql:// URL, unset locally
 */
import { createClient, type Config } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

function resolveConfig(): Config {
  const url = process.env.DATABASE_URL ?? "file:./data/promopedia.db";

  // Remote libSQL (Turso) — production/serverless.
  if (!url.startsWith("file:")) {
    return { url, authToken: process.env.DATABASE_AUTH_TOKEN };
  }

  // Local SQLite file — make the path absolute and ensure the folder exists.
  const filePath = url.slice("file:".length);
  const absolute = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  return { url: `file:${absolute}` };
}

declare global {
  var __promopediaDb: ReturnType<typeof createDb> | undefined;
}

function createDb() {
  const client = createClient(resolveConfig());
  return drizzle(client, { schema });
}

/** Singleton across dev HMR reloads. */
export const db = globalThis.__promopediaDb ?? createDb();
globalThis.__promopediaDb = db;

export type DbClient = typeof db;
