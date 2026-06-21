// POST /api/spaces/:id/restore — restore an archived space before its purge date (gated).
import { NextResponse } from "next/server";
import { spacesController } from "@/server/spaces/spaces.controller";
import { requireCapability } from "@/server/guard";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_spaces");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const r = await spacesController.restore(id);
  return NextResponse.json(r.body, { status: r.status });
}
