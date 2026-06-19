// Next.js instrumentation hook.
//
// In Next.js 15 a root `instrumentation.ts` (here under `src/` since the app
// uses a src directory) is executed automatically once when the server boots —
// no `experimental.instrumentationHook` flag is required (it is stable/default
// in 15). `register()` runs in every server runtime, so we gate the scheduler
// to the Node.js runtime: it must not run on the Edge runtime (no timers /
// long-lived process) or during the browser build.

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startScheduler } = await import("./server/workflows/exec/scheduler");
    startScheduler();
  }
}
