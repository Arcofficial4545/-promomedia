/** Apply pending Drizzle migrations to the local SQLite database. */
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "../lib/db/client-node";

migrate(db, { migrationsFolder: "./lib/db/migrations" });
console.log("Migrations applied.");
