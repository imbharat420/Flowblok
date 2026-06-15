// HTTP adapter for GET /api/commerce/products — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { commerceController } from "@/server/commerce/commerce.controller";

export function GET(req: NextRequest) {
  const result = commerceController.listProducts(req.nextUrl.searchParams);
  return NextResponse.json(result.body, { status: result.status });
}
