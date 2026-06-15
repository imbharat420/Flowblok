// GET /api/workflows/node-types — the node palette catalog.
import { NextResponse } from "next/server";
import { workflowsController } from "@/server/workflows/workflows.controller";

export function GET() {
  const r = workflowsController.nodeTypes();
  return NextResponse.json(r.body, { status: r.status });
}
