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

import { cronMatches } from "./cron";
import { executeWorkflow } from "./engine";
import { workflowsRepository } from "../workflows.repository";

const DEFAULT_CRON = "0 9 * * *"; // 09:00 daily, matching the Schedule node default
const TICK_MS = 30_000; // 30s — fine-grained enough to catch each minute once

interface SchedulerState {
  interval?: ReturnType<typeof setInterval>;
  // workflowId -> last yyyy-mm-dd-HH-mm minute key we fired for (dedupe guard).
  lastFired: Map<string, string>;
}

const store = globalThis as unknown as { __flowblokScheduler?: SchedulerState };

function getState(): SchedulerState {
  return (store.__flowblokScheduler ??= { lastFired: new Map() });
}

/** Build a stable per-minute key, e.g. "2026-06-19-09-00". */
function minuteKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}-${p(d.getMinutes())}`;
}

async function tick(): Promise<void> {
  const state = getState();
  const now = new Date();
  const key = minuteKey(now);

  let workflows;
  try {
    workflows = workflowsRepository.findAll();
  } catch (err) {
    console.error("[scheduler] failed to load workflows:", err);
    return;
  }

  for (const wf of workflows) {
    // Each workflow is isolated: a thrown error must not stop the others.
    try {
      if (wf.status !== "active") continue;

      const scheduleNode = wf.nodes.find((n) => n.type === "schedule");
      if (!scheduleNode) continue;

      const cron = String(scheduleNode.config?.cron ?? DEFAULT_CRON) || DEFAULT_CRON;
      if (!cronMatches(cron, now)) continue;

      // Only fire once per matching clock-minute, even though we tick twice a minute.
      if (state.lastFired.get(wf.id) === key) continue;
      state.lastFired.set(wf.id, key);

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
