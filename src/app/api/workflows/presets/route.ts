// GET /api/workflows/presets — the template gallery.
// POST /api/workflows/presets — instantiate a preset as a new draft workflow.
import { NextResponse } from "next/server";
import { workflowsController } from "@/server/workflows/workflows.controller";
import { requireCapability } from "@/server/guard";

export function GET() {
  const r = workflowsController.presets();
  return NextResponse.json(r.body, { status: r.status });
}

export async function POST(req: Request) {
  const gate = await requireCapability("manage_workflows");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const r = await workflowsController.createFromPreset(body);
  return NextResponse.json(r.body, { status: r.status });
}
