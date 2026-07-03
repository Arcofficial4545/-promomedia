# Data layer — architecture and the future Supabase swap

## Today (local, zero external services)

| Concern | Implementation | Entry point |
|---|---|---|
| Database | SQLite via better-sqlite3 + Drizzle ORM | `lib/db/client.ts` (app) / `lib/db/client-node.ts` (scripts) |
| Schema + migrations | Drizzle Kit, SQL files in `lib/db/migrations/` | `drizzle.config.ts` |
| Data access | Typed repositories — UI/features never import the DB client | `lib/db/repositories/*` |
| Auth | Local `admin_users` table, scrypt hashes, HMAC-signed session cookie | `lib/adapters/auth.ts`, `lib/auth/*` |
| Media storage | Local `public/uploads/` | `lib/adapters/storage.ts` |

Commands:

```
npm run db:generate   # regenerate migrations after schema changes
npm run db:migrate    # apply migrations
npm run db:seed       # wipe + reseed dev data (prints admin credentials)
npm run db:reset      # migrate + seed
```

## Rules the app follows (these make the swap safe)

1. **Nothing outside `lib/db` imports the Drizzle client.** All reads/writes go
   through `lib/db/repositories/*`.
2. **Public reads only return active/published rows** — repositories enforce
   `isActive` / `status='published'` / expiry windows for all public queries.
3. **All writes go through Server Actions** that validate with Zod and check
   the admin session.
4. **Auth and storage are behind interfaces** (`AuthAdapter`,
   `StorageAdapter`); feature code imports `auth` / `storage`, never a
   concrete implementation.
5. **Analytics stores no raw PII** — user agents are SHA-256 hashed before
   insert, IPs are never stored.

## Future: swapping to Supabase

### Database → Supabase Postgres

1. `npm i postgres` (or `@supabase/supabase-js` for PostgREST access — prefer
   the direct Postgres driver with Drizzle).
2. In `lib/db/schema.ts`, switch imports from `drizzle-orm/sqlite-core` to
   `drizzle-orm/pg-core`:
   - `sqliteTable` → `pgTable`
   - `integer(..., { mode: "timestamp_ms" })` → `timestamp(..., { withTimezone: true })`
   - `integer(..., { mode: "boolean" })` → `boolean(...)`
   - `text(..., { mode: "json" })` → `jsonb(...)`
   - `real` → `doublePrecision` / `numeric`
   The table names, column names, relations, and exported row types stay
   identical, so repositories do not change.
3. Replace `lib/db/client-node.ts` internals with
   `drizzle(postgres(process.env.DATABASE_URL))`.
4. Update `drizzle.config.ts` (`dialect: "postgresql"`), regenerate
   migrations against a fresh database, and run the seed.
5. **Enable RLS** on every table; add policies mirroring rule 2 above
   (public `SELECT` only where `is_active`/`published`), and restrict writes
   to the service role. The service-role key lives server-side only.

### Auth → Supabase Auth

1. Implement a `supabaseAuthAdapter: AuthAdapter` in `lib/adapters/auth.ts`
   using `@supabase/ssr` (signInWithPassword, getUser).
2. Replace the session cookie check in `proxy.ts` and `requireAdmin()` with
   the Supabase session. Roles move to a `profiles` table or JWT claims.
3. Delete the local `admin_users` table usage (keep the table until cutover).

### Storage → Supabase Storage

1. Implement `supabaseStorageAdapter: StorageAdapter` (bucket `media`,
   public-read) — `put/delete/list` map 1:1 to the SDK.
2. Point the `storage` export at it. Existing DB rows store URLs, so old
   local URLs keep working until migrated.

No UI or feature code changes in any of the three swaps.
