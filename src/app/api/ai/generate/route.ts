// HTTP adapter for POST /api/ai/generate — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { aiController } from "@/server/ai/ai.controller";
import { requireCapability } from "@/server/guard";

export async function POST(req: NextRequest) {
  const gate = await requireCapability("use_ai");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const result = aiController.generate(body);
  return NextResponse.json(result.body, { status: result.status });
}
