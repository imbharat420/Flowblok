// HTTP adapter for GET /api/spaces — delegates to the controller.
import { NextResponse } from "next/server";
import { spacesController } from "@/server/spaces/spaces.controller";

export function GET() {
  const result = spacesController.list();
  return NextResponse.json(result.body, { status: result.status });
}
