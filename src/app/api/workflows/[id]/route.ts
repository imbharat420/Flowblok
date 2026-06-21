// GET/PUT/DELETE /api/workflows/:id — read, save, or delete a workflow definition.
import { NextResponse } from "next/server";
import { workflowsController } from "@/server/workflows/workflows.controller";
import { requireCapability } from "@/server/guard";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = await workflowsController.getById(id);
  return NextResponse.json(r.body, { status: r.status });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_workflows");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const r = await workflowsController.update(id, body);
  return NextResponse.json(r.body, { status: r.status });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_workflows");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const r = await workflowsController.remove(id);
  return NextResponse.json(r.body, { status: r.status });
}
