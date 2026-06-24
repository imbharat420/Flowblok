// Background cron scheduler for schedule-triggered workflows.
//
// startScheduler() installs a single 30s interval that, on each tick, fires any
// ACTIVE workflow whose Schedule node's cron expression matches the current
// minute — at most once per workflow per clock-minute.
//
// HMR/idempotency: the interval handle and the per-workflow "last fired minute"
// map are pinned on globalThis. In Next.js dev, modules are re-evaluated on hot
// reload and route-handler bundles are separate; a plain module-level interval
// would multiply on every reload. The global guard ensures exactly one interval
// exists for the lifetime of the process.

import { ne } from "drizzle-orm";
import { cronMatches } from "./cron";
import { executeWorkflow } from "./engine";
import { workflowsRepository } from "../workflows.repository";
import { getDb, isConnectionError, resetDb } from "@/server/db/client";
import { schedulerState } from "@/server/db/schema";

const DEFAULT_CRON = "0 9 * * *"; // 09:00 daily, matching the Schedule node default
const TICK_MS = 30_000; // 30s — fine-grained enough to catch each minute once

interface SchedulerState {
  interval?: ReturnType<typeof setInterval>;
}

const store = globalThis as unknown as { __flowblokScheduler?: SchedulerState };

function getState(): SchedulerState {
  return (store.__flowblokScheduler ??= {});
}

// Atomically claim the right to fire `workflowId` for clock-minute `key`. Uses
// an upsert whose DO UPDATE only fires when the stored minute differs, so even
// across multiple instances exactly one claim succeeds per minute (returns true).
async function claimFire(workflowId: string, key: string): Promise<boolean> {
  const db = await getDb();
  const claimed = await db
    .insert(schedulerState)
    .values({ workflowId, lastFiredMinute: key })
    .onConflictDoUpdate({
      target: schedulerState.workflowId,
      set: { lastFiredMinute: key },
      setWhere: ne(schedulerState.lastFiredMinute, key),
    })
    .returning({ workflowId: schedulerState.workflowId });
  return claimed.length > 0;
}

/** Build a stable per-minute key, e.g. "2026-06-19-09-00". */
function minuteKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}-${p(d.getMinutes())}`;
}

async function tick(): Promise<void> {
  const now = new Date();
  const key = minuteKey(now);

  let workflows;
  try {
    workflows = await workflowsRepository.findAll();
  } catch (err) {
    // A dropped DB connection leaves a dead memoized handle. Rebuild it and try
    // once more this tick; if it still fails, the next tick retries fresh.
    if (isConnectionError(err)) {
      await resetDb().catch(() => {});
      try {
        workflows = await workflowsRepository.findAll();
      } catch (retryErr) {
        console.warn("[scheduler] DB unavailable, skipping tick:", (retryErr as Error).message);
        return;
      }
    } else {
      console.error("[scheduler] failed to load workflows:", err);
      return;
    }
  }

  for (const wf of workflows) {
    // Each workflow is isolated: a thrown error must not stop the others.
    try {
      if (wf.status !== "active") continue;

      const scheduleNode = wf.nodes.find((n) => n.type === "schedule");
      if (!scheduleNode) continue;

      const cron = String(scheduleNode.config?.cron ?? DEFAULT_CRON) || DEFAULT_CRON;
      if (!cronMatches(cron, now)) continue;

      // Durably claim this clock-minute (survives restarts; one claim wins across
      // instances) so we fire at most once per matching minute.
      if (!(await claimFire(wf.id, key))) continue;

      console.log(`[scheduler] firing workflow ${wf.id} (cron "${cron}") at ${now.toISOString()}`);
      // Fire-and-track: await so a per-workflow failure is caught here, but a
      // throw still can't escape this try/catch into the loop.
      await executeWorkflow(wf, {
        trigger: "schedule",
        payload: { firedAt: now.toISOString() },
      });
    } catch (err) {
      console.error(`[scheduler] workflow ${wf.id} failed:`, err);
    }
  }
}

/**
 * Start the scheduler. Idempotent and HMR-safe: only ever creates one interval.
 */
export function startScheduler(): void {
  const state = getState();
  if (state.interval) return; // already running — do nothing

  state.interval = setInterval(() => {
    void tick();
  }, TICK_MS);

  // Don't keep the Node process alive solely for this timer (server/build tools).
  if (typeof state.interval.unref === "function") state.interval.unref();

  console.log(`[scheduler] started (tick every ${TICK_MS / 1000}s)`);
}
