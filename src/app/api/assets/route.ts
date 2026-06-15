// HTTP adapter for GET /api/assets — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { assetsController } from "@/server/assets/assets.controller";

export function GET(req: NextRequest) {
  const result = assetsController.list(req.nextUrl.searchParams);
  return NextResponse.json(result.body, { status: result.status });
}
