// HTTP adapter for /api/spaces — delegates to the controller.
import { NextResponse } from "next/server";
import { spacesController } from "@/server/spaces/spaces.controller";
import { requireCapability } from "@/server/guard";

export async function GET() {
  const result = await spacesController.list();
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: Request) {
  const gate = await requireCapability("manage_spaces");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const result = await spacesController.create(body);
  return NextResponse.json(result.body, { status: result.status });
}
