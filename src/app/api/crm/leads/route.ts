// HTTP adapter for POST /api/crm/leads — creates a new lead. Guarded by "manage_crm".
import { NextResponse } from "next/server";
import { crmController } from "@/server/crm/crm.controller";
import { requireCapability } from "@/server/guard";

export async function POST(req: Request) {
  const gate = await requireCapability("manage_crm");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });

  const body = await req.json().catch(() => null);
  const result = crmController.createLead(body);
  return NextResponse.json(result.body, { status: result.status });
}
