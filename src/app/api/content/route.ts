// HTTP adapter for GET /api/content — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { contentController } from "@/server/content/content.controller";

export function GET(req: NextRequest) {
  const result = contentController.list(req.nextUrl.searchParams);
  return NextResponse.json(result.body, { status: result.status });
}
