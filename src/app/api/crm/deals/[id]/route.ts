// HTTP adapter for PUT /api/crm/deals/:id — moves a deal to a stage. Guarded by "manage_crm".
import { NextResponse } from "next/server";
import { crmController } from "@/server/crm/crm.controller";
import { requireCapability } from "@/server/guard";

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_crm");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const result = crmController.moveDeal(id, body);
  return NextResponse.json(result.body, { status: result.status });
}
