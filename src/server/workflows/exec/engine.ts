// Workflow execution engine.
//
// Runs a workflow as a directed graph: seed the trigger node(s) with the input
// payload, then process nodes in topological order, passing items along
// connections. Branching nodes (e.g. If) emit named ports; a connection's
// fromPort selects which output it carries. Every node produces a run log.

import type { ExecItem, RunTrigger, NodeRunLog, Workflow, WorkflowNode, WorkflowRun } from "@/lib/types";
import { isSubNode, isSubPort, SUB_NODE_PORT } from "@/lib/subnodes";
import { resolveValue } from "./expressions";
import { getHandler, type SubNodes } from "./handlers";
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
  // Independent copies so node mutations never alias the shared trigger payload.
  const vars = safeClone(opts.payload ?? {});
  const seedItems: ExecItem[] = [{ json: safeClone(opts.payload ?? {}) }];

  const nodesById = new Map(wf.nodes.map((n) => [n.id, n]));

  // Sub-nodes (Chat Model / Memory / Tool) attach to a parent via a sub-port
  // connection (toPort = ai_*). They are NOT part of the main data flow: they
  // don't run on their own and their edges don't count as flow inputs.
  const subNodesByParent = new Map<string, SubNodes>();
  for (const c of wf.connections) {
    if (!isSubPort(c.toPort)) continue;
    const src = nodesById.get(c.from);
    const parent = nodesById.get(c.to);
    if (!src || !parent) continue;
    if (parent.type !== "ai_agent") continue; // only the AI Agent hosts sub-nodes
    if (SUB_NODE_PORT[src.type] !== c.toPort) continue; // source must be a sub-node of that kind
    const slot = subNodesByParent.get(c.to) ?? { tools: [] };
    // Chat Model / Memory are single-slot — keep the first, deterministically.
    if (c.toPort === "ai_model") {
      if (!slot.model) slot.model = src;
    } else if (c.toPort === "ai_memory") {
      if (!slot.memory) slot.memory = src;
    } else {
      slot.tools.push(src);
    }
    subNodesByParent.set(c.to, slot);
  }

  // Flow nodes = everything that isn't an attached sub-node type.
  const flowNodes = wf.nodes.filter((n) => !isSubNode(n.type));
  const isFlow = new Set(flowNodes.map((n) => n.id));

  const outgoing = new Map<string, Array<{ to: string; fromPort: string }>>();
  const indegree = new Map<string, number>();
  for (const n of flowNodes) {
    outgoing.set(n.id, []);
    indegree.set(n.id, 0);
  }
  for (const c of wf.connections) {
    if (isSubPort(c.toPort)) continue; // sub-node attachment, not a flow edge
    if (!isFlow.has(c.from) || !isFlow.has(c.to)) continue;
    outgoing.get(c.from)!.push({ to: c.to, fromPort: c.fromPort ?? "main" });
    indegree.set(c.to, (indegree.get(c.to) ?? 0) + 1);
  }

  // Seed inputs: the matched webhook node, else all triggers, else all roots.
  const inputs = new Map<string, ExecItem[]>();
  const triggers = flowNodes.filter((n) => isTrigger(n));
  const roots = flowNodes.filter((n) => (indegree.get(n.id) ?? 0) === 0);
  const seedTargets = opts.seedNodeId
    ? [opts.seedNodeId]
    : (triggers.length ? triggers : roots).map((n) => n.id);
  for (const id of seedTargets) inputs.set(id, seedItems);

  // Kahn's topological order over flow nodes only.
  const queue = flowNodes.filter((n) => (indegree.get(n.id) ?? 0) === 0).map((n) => n.id);
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
  // Cyclic / unreachable flow nodes never reach indegree 0. Run them as
  // "skipped" rather than executing with bogus inputs.
  const reachable = new Set(order);
  const execOrder = [...order, ...flowNodes.filter((n) => !reachable.has(n.id)).map((n) => n.id)];

  let failed = false;
  for (const nodeId of execOrder) {
    const node = nodesById.get(nodeId);
    if (!node) continue;
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
      inputSample: capItems(input),
      output: [],
      messages,
    };

    if (!reachable.has(nodeId)) {
      log.status = "skipped";
      log.error = "Unreachable — part of a cycle";
      log.finishedAt = new Date().toISOString();
      run.nodeLogs.push(log);
      continue;
    }

    if (failed) {
      log.status = "skipped";
      log.finishedAt = new Date().toISOString();
      run.nodeLogs.push(log);
      continue;
    }

    // A node with no input items did not have its branch taken — skip it
    // rather than running its handler against a synthetic empty item.
    if (input.length === 0) {
      log.status = "skipped";
      messages.push("no input items (branch not taken)");
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
        subNodes: subNodesByParent.get(nodeId) ?? { tools: [] },
        getParam: (key, item) =>
          resolveValue(node.config?.[key], { item: item ?? input[0] ?? { json: {} }, now: nowIso, vars }),
        log: (m) => messages.push(m),
      });
      const mainOut = result.items ?? [];
      log.status = "success";
      log.itemsOut = mainOut.length;
      log.output = capItems(mainOut);

      // Distribute outputs to downstream nodes by port. A branching node (e.g.
      // If) routes by the connection's fromPort; legacy/unset edges default to
      // the primary "true" port. Clone items so fan-out siblings can't mutate
      // each other's data through a shared reference.
      for (const edge of outgoing.get(nodeId) ?? []) {
        const portItems = result.branches ? (result.branches[edge.fromPort ?? "true"] ?? []) : mainOut;
        const cloned = portItems.map((it) => ({ json: safeClone(it.json) }));
        inputs.set(edge.to, [...(inputs.get(edge.to) ?? []), ...cloned]);
      }
    } catch (err) {
      log.status = "error";
      log.error = (err as Error).message;
      run.error = `${node.name}: ${(err as Error).message}`;
      // "Continue on fail" (set in the node's Settings) keeps the run going.
      if (!node.config?._continueOnFail) failed = true;
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
  return items.slice(0, MAX_OUTPUT_SAMPLE).map((i) => ({ json: safeClone(i.json) }));
}

// Deep-copy item data defensively (handlers may produce non-structured-cloneable
// values; fall back through JSON, then a shallow copy).
function safeClone(o: Record<string, unknown>): Record<string, unknown> {
  try {
    return structuredClone(o);
  } catch {
    try {
      return JSON.parse(JSON.stringify(o));
    } catch {
      return { ...o };
    }
  }
}
