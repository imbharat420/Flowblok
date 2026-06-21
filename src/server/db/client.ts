// Database client + migrations. Uses real Postgres when DATABASE_URL is set
// (postgres.js), otherwise an embedded PGlite instance persisted to ./.data/pg
// so the app runs with zero setup locally. Both are Postgres, so the same
// Drizzle schema and SQL migrations apply to either.
//
// The connection is memoized on globalThis (Next.js dev re-evaluates modules
// and each route handler is its own bundle — a plain module singleton would
// open a new pool per bundle).

import path from "node:path";
import fs from "node:fs";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import * as schema from "./schema";

// Both drivers expose the same Drizzle query API; we surface one type so the
// repositories don't deal with a driver union.
export type AppDb = PgliteDatabase<typeof schema>;

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");

async function createDb() {
  const url = process.env.DATABASE_URL;
  if (url) {
    const [{ drizzle }, postgresMod] = await Promise.all([
      import("drizzle-orm/postgres-js"),
      import("postgres"),
    ]);
    const client = postgresMod.default(url, { max: 10, prepare: false });
    const db = drizzle(client, { schema });
    return { db, driver: "postgres" as const, raw: client };
  }
  const [{ PGlite }, { drizzle }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
  ]);
  const dataDir = path.join(process.cwd(), ".data", "pg");
  fs.mkdirSync(dataDir, { recursive: true }); // PGlite's own mkdir isn't recursive
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  return { db, driver: "pglite" as const, raw: client };
}

type Holder = {
  __flowblokDb?: Promise<Awaited<ReturnType<typeof createDb>>>;
  __flowblokMigrated?: Promise<void>;
};
const g = globalThis as unknown as Holder;

function getHandle() {
  // Clear the cache on failure so a transient error doesn't brick the process.
  return (g.__flowblokDb ??= createDb().catch((e) => {
    g.__flowblokDb = undefined;
    throw e;
  }));
}

/** Get the Drizzle db, ensuring migrations have run first. */
export async function getDb(): Promise<AppDb> {
  await runMigrations();
  const { db } = await getHandle();
  return db as unknown as AppDb;
}

/** Apply pending migrations once per process. Idempotent. */
export function runMigrations(): Promise<void> {
  return (g.__flowblokMigrated ??= (async () => {
    const handle = await getHandle();
    if (handle.driver === "postgres") {
      const { migrate } = await import("drizzle-orm/postgres-js/migrator");
      await migrate(handle.db, { migrationsFolder: MIGRATIONS_DIR });
    } else {
      const { migrate } = await import("drizzle-orm/pglite/migrator");
      await migrate(handle.db, { migrationsFolder: MIGRATIONS_DIR });
    }
    console.log(`[db] migrations applied (${handle.driver})`);
  })().catch((e) => {
    // Don't cache a failed migration — allow a later call to retry.
    g.__flowblokMigrated = undefined;
    throw e;
  }));
}

export { schema };
