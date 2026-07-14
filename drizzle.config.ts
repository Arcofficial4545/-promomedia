import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "file:./data/promopedia.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
