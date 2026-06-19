// Workflow execution engine.
//
// Runs a workflow as a directed graph: seed the trigger node(s) with the input
// payload, then process nodes in topological order, passing items along
// connections. Branching nodes (e.g. If) emit named ports; a connection's
// fromPort selects which output it carries. Every node produces a run log.

import type { ExecItem, RunTrigger, NodeRunLog, Workflow, WorkflowNode, WorkflowRun } from "@/lib/types";
import { resolveValue } from "./expressions";
import { getHandler } from "./handlers";
import { saveRun } from "./runs";
import { workflowsRepository } from "../workflows.repository";
import "./register"; // ensure all handlers are registered

const MAX_OUTPUT_SAMPLE = 5;

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

interface RunOptions {
  trigger: RunTrigger;
  seedNodeId?: string; // node to seed (e.g. the matched webhook); defaults to all triggers
  payload?: Record<string, unknown>;
}

export async function executeWorkflow(wf: Workflow, opts: RunOptions): Promise<WorkflowRun> {
  const startedAt = new Date();
  const run: WorkflowRun = {
    id: newId("run"),
    workflowId: wf.id,
    status: "running",
    trigger: opts.trigger,
    startedAt: startedAt.toISOString(),
    finishedAt: null,
    durationMs: 0,
    nodeLogs: [],
  };
  saveRun(run);

  const nowIso = startedAt.toISOString();
  const vars = opts.payload ?? {};
  const seedItems: ExecItem[] = [{ json: opts.payload ?? {} }];

  const nodesById = new Map(wf.nodes.map((n) => [n.id, n]));
  const outgoing = new Map<string, Array<{ to: string; fromPort: string }>>();
  const indegree = new Map<string, number>();
  for (const n of wf.nodes) {
    outgoing.set(n.id, []);
    indegree.set(n.id, 0);
  }
  for (const c of wf.connections) {
    if (!nodesById.has(c.from) || !nodesById.has(c.to)) continue;
    outgoing.get(c.from)!.push({ to: c.to, fromPort: c.fromPort ?? "main" });
    indegree.set(c.to, (indegree.get(c.to) ?? 0) + 1);
  }

  // Seed inputs: the matched webhook node, else all triggers, else all roots.
  const inputs = new Map<string, ExecItem[]>();
  const triggers = wf.nodes.filter((n) => isTrigger(n));
  const roots = wf.nodes.filter((n) => (indegree.get(n.id) ?? 0) === 0);
  const seedTargets = opts.seedNodeId
    ? [opts.seedNodeId]
    : (triggers.length ? triggers : roots).map((n) => n.id);
  for (const id of seedTargets) inputs.set(id, seedItems);

  // Kahn's topological order.
  const queue = wf.nodes.filter((n) => (indegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  const deg = new Map(indegree);
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const edge of outgoing.get(id) ?? []) {
      deg.set(edge.to, (deg.get(edge.to) ?? 0) - 1);
      if ((deg.get(edge.to) ?? 0) === 0) queue.push(edge.to);
    }
  }
  if (order.length < wf.nodes.length) {
    // Cycle: append the unreached nodes so they at least get logged as skipped.
    for (const n of wf.nodes) if (!order.includes(n.id)) order.push(n.id);
  }

  let failed = false;
  for (const nodeId of order) {
    const node = nodesById.get(nodeId)!;
    const input = inputs.get(nodeId) ?? [];
    const messages: string[] = [];
    const log: NodeRunLog = {
      nodeId,
      nodeName: node.name,
      nodeType: node.type,
      status: "success",
      startedAt: new Date().toISOString(),
      finishedAt: "",
      itemsIn: input.length,
      itemsOut: 0,
      output: [],
      messages,
    };

    if (failed) {
      log.status = "skipped";
      log.finishedAt = new Date().toISOString();
      run.nodeLogs.push(log);
      continue;
    }

    try {
      const handler = getHandler(node.type);
      const result = await handler({
        node,
        items: input,
        now: nowIso,
        vars,
        getParam: (key, item) =>
          resolveValue(node.config?.[key], { item: item ?? input[0] ?? { json: {} }, now: nowIso, vars }),
        log: (m) => messages.push(m),
      });
      const mainOut = result.items ?? [];
      log.status = "success";
      log.itemsOut = mainOut.length;
      log.output = capItems(mainOut);

      // Distribute outputs to downstream nodes by port.
      for (const edge of outgoing.get(nodeId) ?? []) {
        const portItems =
          edge.fromPort !== "main" && result.branches ? (result.branches[edge.fromPort] ?? []) : mainOut;
        inputs.set(edge.to, [...(inputs.get(edge.to) ?? []), ...portItems]);
      }
    } catch (err) {
      log.status = "error";
      log.error = (err as Error).message;
      run.error = `${node.name}: ${(err as Error).message}`;
      failed = true;
    }
    log.finishedAt = new Date().toISOString();
    run.nodeLogs.push(log);
  }

  run.status = failed ? "error" : "success";
  run.finishedAt = new Date().toISOString();
  run.durationMs = Date.parse(run.finishedAt) - startedAt.getTime();

  // Reflect the run on the workflow record (run count + last run time).
  bumpWorkflowStats(wf.id, run);

  return run;
}

function bumpWorkflowStats(workflowId: string, run: WorkflowRun): void {
  const wf = workflowsRepository.findById(workflowId);
  if (!wf) return;
  wf.runs += 1;
  wf.lastRun = run.finishedAt;
}

function isTrigger(node: WorkflowNode): boolean {
  return node.type === "webhook" || node.type === "schedule" || node.type === "form_submit";
}

function capItems(items: ExecItem[]): ExecItem[] {
  return items.slice(0, MAX_OUTPUT_SAMPLE).map((i) => ({ json: i.json }));
}
