// HTTP adapter for GET/POST /api/content — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { contentController } from "@/server/content/content.controller";
import { requireCapability } from "@/server/guard";

export function GET(req: NextRequest) {
  const result = contentController.list(req.nextUrl.searchParams);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: NextRequest) {
  const gate = await requireCapability("edit_content");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const result = contentController.create(body);
  return NextResponse.json(result.body, { status: result.status });
}
