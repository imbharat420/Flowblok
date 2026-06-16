// HTTP adapter for PUT /api/settings/general — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/server/settings/settings.controller";
import { requireCapability } from "@/server/guard";

export async function PUT(req: NextRequest) {
  const gate = await requireCapability("manage_settings");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const result = settingsController.updateGeneral(body);
  return NextResponse.json(result.body, { status: result.status });
}
