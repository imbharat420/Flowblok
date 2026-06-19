// In-memory run history, pinned on globalThis so every route handler shares it.
import type { WorkflowRun } from "@/lib/types";

const store = globalThis as unknown as { __flowblokRuns?: WorkflowRun[] };
const RUNS: WorkflowRun[] = (store.__flowblokRuns ??= []);

export function saveRun(run: WorkflowRun): void {
  RUNS.unshift(run); // store the live reference; the engine mutates it as the run progresses
  if (RUNS.length > 200) RUNS.length = 200;
}

export function runsForWorkflow(workflowId: string, limit = 20): WorkflowRun[] {
  return RUNS.filter((r) => r.workflowId === workflowId).slice(0, limit);
}

export function getRun(id: string): WorkflowRun | undefined {
  return RUNS.find((r) => r.id === id);
}
