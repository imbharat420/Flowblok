// Run history, persisted to Postgres (Drizzle). The engine inserts a run row
// when execution starts (status "running") and finalizes it when it completes.
import type { WorkflowRun } from "@/lib/types";
import { getDb } from "@/server/db/client";
import { workflowRuns } from "@/server/db/schema";
import { eq, desc } from "drizzle-orm";

type RunRow = typeof workflowRuns.$inferSelect;

function rowToRun(r: RunRow): WorkflowRun {
  return {
    id: r.id,
    workflowId: r.workflowId,
    status: r.status as WorkflowRun["status"],
    trigger: r.trigger as WorkflowRun["trigger"],
    startedAt: new Date(r.startedAt).toISOString(),
    finishedAt: r.finishedAt ? new Date(r.finishedAt).toISOString() : null,
    durationMs: r.durationMs,
    nodeLogs: r.nodeLogs ?? [],
    error: r.error ?? undefined,
  };
}

/** Insert the run row at the start of execution. */
export async function saveRun(run: WorkflowRun): Promise<void> {
  const db = await getDb();
  await db.insert(workflowRuns).values({
    id: run.id,
    workflowId: run.workflowId,
    status: run.status,
    trigger: run.trigger,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    durationMs: run.durationMs,
    nodeLogs: run.nodeLogs,
    error: run.error,
  });
}

/** Persist the final state of a run (status, logs, timing). */
export async function finalizeRun(run: WorkflowRun): Promise<void> {
  const db = await getDb();
  await db
    .update(workflowRuns)
    .set({
      status: run.status,
      finishedAt: run.finishedAt,
      durationMs: run.durationMs,
      nodeLogs: run.nodeLogs,
      error: run.error,
    })
    .where(eq(workflowRuns.id, run.id));
}

export async function runsForWorkflow(workflowId: string, limit = 20): Promise<WorkflowRun[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(workflowRuns)
    .where(eq(workflowRuns.workflowId, workflowId))
    .orderBy(desc(workflowRuns.startedAt))
    .limit(limit);
  return rows.map(rowToRun);
}

export async function getRun(id: string): Promise<WorkflowRun | undefined> {
  const db = await getDb();
  const rows = await db.select().from(workflowRuns).where(eq(workflowRuns.id, id)).limit(1);
  return rows[0] ? rowToRun(rows[0]) : undefined;
}
