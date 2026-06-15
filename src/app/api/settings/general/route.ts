// HTTP adapter for PUT /api/settings/general — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/server/settings/settings.controller";

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const result = settingsController.updateGeneral(body);
  return NextResponse.json(result.body, { status: result.status });
}
