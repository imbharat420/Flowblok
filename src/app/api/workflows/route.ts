// GET /api/workflows — list workflows. POST — create a workflow.
import { NextResponse } from "next/server";
import { workflowsController } from "@/server/workflows/workflows.controller";
import { requireCapability } from "@/server/guard";

export async function GET() {
  const r = await workflowsController.list();
  return NextResponse.json(r.body, { status: r.status });
}

export async function POST(req: Request) {
  const gate = await requireCapability("manage_workflows");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const r = await workflowsController.create(body);
  return NextResponse.json(r.body, { status: r.status });
}
