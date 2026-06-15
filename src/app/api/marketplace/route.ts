// HTTP adapter for GET /api/marketplace — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { marketplaceController } from "@/server/marketplace/marketplace.controller";

export function GET(req: NextRequest) {
  const result = marketplaceController.list(req.nextUrl.searchParams);
  return NextResponse.json(result.body, { status: result.status });
}
