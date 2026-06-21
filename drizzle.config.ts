import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` reads the schema and emits SQL migrations to ./drizzle
// (no live DB needed). The same migrations apply to Postgres or embedded PGlite.
export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Used by `db:migrate` / `db:studio` / `db:push` against a real Postgres.
  // `db:generate` (the common path) and migrate-on-boot don't need this.
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://localhost:5432/flowblok" },
});
