// HTTP adapter for GET /api/settings — delegates to the controller.
import { NextResponse } from "next/server";
import { settingsController } from "@/server/settings/settings.controller";

export function GET() {
  const result = settingsController.snapshot();
  return NextResponse.json(result.body, { status: result.status });
}
