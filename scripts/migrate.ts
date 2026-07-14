/** Apply pending Drizzle migrations to the configured libSQL database
 * (local file or remote Turso, depending on DATABASE_URL). */
import { migrate } from "drizzle-orm/libsql/migrator";
import { db } from "../lib/db/client-node";

async function main() {
  await migrate(db, { migrationsFolder: "./lib/db/migrations" });
  console.log("Migrations applied.");
}

void main();
