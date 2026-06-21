// Next.js instrumentation hook — runs once when the server boots (Node runtime
// only). We apply DB migrations, seed first-run data, then start the workflow
// scheduler. Edge runtime is skipped (no DB driver / long-lived process there).

export async function register(): Promise<void> {
  // Wrap ALL Node-only imports in a POSITIVE runtime check. Next compiles this
  // hook for the Edge runtime too; with `process.env.NEXT_RUNTIME` inlined as a
  // string literal per build, webpack dead-code-eliminates this whole block from
  // the Edge bundle — so postgres/pglite/node:crypto are never compiled there.
  // (An early `if (… !== "nodejs") return;` does NOT get eliminated and pulls
  // the DB chain into the Edge build → UnhandledSchemeError / build failures.)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Fail fast on production misconfiguration rather than booting with a weak,
    // hardcoded credential-encryption key.
    if (process.env.NODE_ENV === "production" && !process.env.CRED_SECRET) {
      throw new Error("CRED_SECRET must be set in production (credential encryption key).");
    }
    if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
      console.warn("[boot] DATABASE_URL not set in production — using embedded PGlite (not recommended).");
    }

    const { runMigrations } = await import("./server/db/client");
    await runMigrations();

    const { seedDatabase } = await import("./server/db/seed");
    await seedDatabase();

    const { startScheduler } = await import("./server/workflows/exec/scheduler");
    startScheduler();
  }
}
