// GET /api/workflows/:id/runs — recent run history for a workflow.
import { NextResponse } from "next/server";
import { runsForWorkflow } from "@/server/workflows/exec/runs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  return NextResponse.json({ items: runsForWorkflow(id) }, { status: 200 });
}
