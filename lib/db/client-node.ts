/**
 * Drizzle client over Postgres (Supabase) using the postgres-js driver.
 *
 * App code imports `lib/db/client` (adds the `server-only` guard); this module
 * exists so CLI scripts (seed, migrate) can reuse the same connection.
 *
 * Env:
 *  - DATABASE_URL  the Supabase Postgres connection string. Use the
 *    "Transaction" pooler URL (port 6543) for serverless/Vercel.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __promopediaSql: ReturnType<typeof postgres> | undefined;
  var __promopediaDb: ReturnType<typeof createClient> | undefined;
}

function createClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Point it at your Supabase Postgres connection string.",
    );
  }
  // `prepare: false` keeps us compatible with Supabase's transaction pooler
  // (pgBouncer), which does not support prepared statements.
  const sql = globalThis.__promopediaSql ?? postgres(url, { prepare: false });
  globalThis.__promopediaSql = sql;
  return drizzle(sql, { schema });
}

/** Singleton across dev HMR reloads. */
export const db = globalThis.__promopediaDb ?? createClient();
globalThis.__promopediaDb = db;

export type DbClient = typeof db;
