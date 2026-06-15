// HTTP adapter for POST /api/ai/generate — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { aiController } from "@/server/ai/ai.controller";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const result = aiController.generate(body);
  return NextResponse.json(result.body, { status: result.status });
}
