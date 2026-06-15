// GET /api/workflows — list workflows.
import { NextResponse } from "next/server";
import { workflowsController } from "@/server/workflows/workflows.controller";

export function GET() {
  const r = workflowsController.list();
  return NextResponse.json(r.body, { status: r.status });
}
