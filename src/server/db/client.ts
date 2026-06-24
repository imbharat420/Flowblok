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
    const client = postgresMod.default(url, {
      max: 10,
      prepare: false,
      // Resilience for flaky links: recycle idle/old sockets so we never reuse a
      // half-dead connection, and bound how long a connect attempt can hang.
      idle_timeout: 20, // seconds — close idle connections
      max_lifetime: 60 * 30, // seconds — recycle a connection after 30 min
      connect_timeout: 15, // seconds — fail fast instead of hanging
      onnotice: () => {}, // silence NOTICE chatter
    });
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

// Connection-level errors (socket dropped, reset, timed out) — as opposed to
// SQL/logic errors. After one of these the memoized handle is dead and must be
// rebuilt, so callers should reset() and retry rather than reusing it.
const CONN_ERR_CODES = new Set([
  "ECONNABORTED",
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "CONNECTION_CLOSED",
  "CONNECTION_ENDED",
  "CONNECT_TIMEOUT",
  "CONNECTION_DESTROYED",
]);

export function isConnectionError(err: unknown): boolean {
  const e = err as { code?: string; cause?: { code?: string }; message?: string } | undefined;
  const code = e?.code ?? e?.cause?.code;
  if (code && CONN_ERR_CODES.has(code)) return true;
  return /ECONNABORTED|ECONNRESET|ECONNREFUSED|EPIPE|ETIMEDOUT|terminat|closed the connection/i.test(e?.message ?? "");
}

/** Drop the memoized connection (and end the underlying client) so the next
 *  getDb() builds a fresh one. Call after a connection-level failure. */
export async function resetDb(): Promise<void> {
  const pending = g.__flowblokDb;
  g.__flowblokDb = undefined;
  if (!pending) return;
  try {
    const handle = await pending;
    if (handle.driver === "postgres") {
      await (handle.raw as { end?: (o?: { timeout?: number }) => Promise<void> }).end?.({ timeout: 5 });
    }
  } catch {
    /* the connection was already broken — nothing to clean up */
  }
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
