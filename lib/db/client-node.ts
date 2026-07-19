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
  // Use Supabase's SESSION pooler (port 5432), not the transaction pooler
  // (6543): postgres.js pipelines concurrent queries onto a connection, which
  // pgBouncer's transaction mode cannot serve — it deadlocks. Session mode
  // handles pipelined concurrency fine on a held connection.
  //
  // Connections: 1 in production so each serverless function instance holds a
  // single session connection and they don't exhaust the small pooler under
  // load (which caused 500s when navigating between pages); a few more in
  // local dev for parallelism. `connect_timeout` fails fast instead of hanging.
  const max = process.env.NODE_ENV === "production" ? 1 : 5;
  const sql =
    globalThis.__promopediaSql ??
    postgres(url, {
      prepare: false,
      max,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  globalThis.__promopediaSql = sql;
  return drizzle(sql, { schema });
}

/** Singleton across dev HMR reloads. */
export const db = globalThis.__promopediaDb ?? createClient();
globalThis.__promopediaDb = db;

export type DbClient = typeof db;
