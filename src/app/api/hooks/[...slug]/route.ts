// GET/POST /api/hooks/<path> — public webhook trigger endpoint.
//
// Resolves the catch-all slug to a registered webhook node on an ACTIVE
// workflow and fires the engine. No auth gate (webhooks are called by external
// systems), but only active workflows ever execute.

import { NextResponse } from "next/server";
import type { Workflow, WorkflowNode } from "@/lib/types";
import { workflowsRepository } from "@/server/workflows/workflows.repository";
import { executeWorkflow } from "@/server/workflows/exec/engine";

/** Normalize a configured webhook path: drop a leading "/", trim, lowercase. */
function normalizePath(raw: unknown): string {
  return String(raw ?? "").trim().replace(/^\/+/, "").toLowerCase();
}

/** Find an active workflow + its matching webhook node for the given slug path. */
async function matchWebhook(path: string): Promise<{ wf: Workflow; node: WorkflowNode } | null> {
  for (const wf of await workflowsRepository.findAll()) {
    if (wf.status !== "active") continue;
    for (const node of wf.nodes) {
      if (node.type !== "webhook") continue;
      if (normalizePath(node.config?.path) === path) return { wf, node };
    }
  }
  return null;
}

async function handle(req: Request, ctx: { params: Promise<{ slug: string[] }> }) {
  try {
    const { slug } = await ctx.params;
    const path = (slug ?? []).join("/").toLowerCase();

    const match = await matchWebhook(path);
    if (!match) {
      return NextResponse.json({ error: "No active webhook for path", path }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as unknown;
    const query: Record<string, string> = {};
    for (const [key, value] of new URL(req.url).searchParams) query[key] = value;

    const run = await executeWorkflow(match.wf, {
      trigger: "webhook",
      seedNodeId: match.node.id,
      payload: { body, query, method: req.method },
    });

    return NextResponse.json({ ok: true, runId: run.id, status: run.status }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
