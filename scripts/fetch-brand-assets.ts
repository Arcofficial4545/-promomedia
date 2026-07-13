/**
 * Brand-asset pipeline (Section 6). Fetches real logos + covers for every
 * active, non-fictional store and writes them to /public, updating the DB.
 *
 *   npm run assets:fetch                 # all stores
 *   npm run assets:fetch -- --slug=base44   # one store
 *
 * Logic lives in lib/brand/fetchAssets.ts and is shared with the admin
 * "Refetch brand assets" action. Fictional demo brands keep the letter tile.
 */
import { and, eq } from "drizzle-orm";

try {
  process.loadEnvFile(".env.local");
} catch {
  // fine — fall back to existing environment
}

import { db } from "../lib/db/client-node";
import { stores } from "../lib/db/schema";
import { fetchBrandAssets } from "../lib/brand/fetchAssets";

function argSlug(): string | null {
  const arg = process.argv.find((a) => a.startsWith("--slug="));
  return arg ? arg.slice("--slug=".length) : null;
}

async function main() {
  const only = argSlug();
  const rows = await db
    .select({ id: stores.id, slug: stores.slug, websiteUrl: stores.websiteUrl })
    .from(stores)
    .where(
      only
        ? eq(stores.slug, only)
        : and(eq(stores.isActive, true), eq(stores.isFictional, false)),
    );

  if (rows.length === 0) {
    console.log(only ? `No store with slug "${only}".` : "No stores to fetch.");
    return;
  }

  console.log(
    `Fetching brand assets for ${rows.length} store${rows.length === 1 ? "" : "s"}...\n`,
  );
  console.log(
    "  slug           logo source      cover  theme    detail",
  );
  console.log("  " + "-".repeat(62));

  let ok = 0;
  let failed = 0;
  for (const store of rows) {
    const r = await fetchBrandAssets(store);
    await db
      .update(stores)
      .set({
        logoUrl: r.logoUrl ?? undefined,
        coverImageUrl: r.coverImageUrl ?? undefined,
        themeColor: r.themeColor ?? undefined,
      })
      .where(eq(stores.id, store.id));

    if (r.logoUrl) ok++;
    else failed++;

    console.log(
      "  " +
        store.slug.padEnd(14) +
        " " +
        r.logoSource.padEnd(16) +
        " " +
        (r.coverImageUrl ? "yes " : "no  ") +
        " " +
        (r.themeColor ?? "—").padEnd(8) +
        " " +
        r.detail,
    );
  }

  console.log("");
  console.log(`Done. ${ok} logo(s) fetched, ${failed} using letter-tile fallback.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
