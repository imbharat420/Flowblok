// GET /api/workflows/:id — a single workflow definition (nodes + connections).
import { NextResponse } from "next/server";
import { workflowsController } from "@/server/workflows/workflows.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = workflowsController.getById(id);
  return NextResponse.json(r.body, { status: r.status });
}
