// POST /api/workflows/:id/run — execute the workflow now (manual trigger).
import { NextResponse } from "next/server";
import { workflowsService } from "@/server/workflows/workflows.service";
import { executeWorkflow } from "@/server/workflows/exec/engine";
import { requireCapability } from "@/server/guard";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_workflows");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const wf = workflowsService.get(id);
  if (!wf) return NextResponse.json({ error: "Workflow not found", id }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const payload = body && typeof body.payload === "object" && body.payload ? (body.payload as Record<string, unknown>) : body ?? {};

  const run = await executeWorkflow(wf, { trigger: "manual", payload });
  return NextResponse.json(run, { status: 200 });
}
