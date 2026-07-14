/** Apply pending Drizzle migrations to the configured Postgres database. */
// tsx doesn't load Next's env files; pick up .env.local ourselves first so the
// client picks up DATABASE_URL before it connects.
try {
  process.loadEnvFile(".env.local");
} catch {
  // fine — fall back to whatever is already in the environment
}

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "../lib/db/client-node";

async function main() {
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  console.log("Migrations applied.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
