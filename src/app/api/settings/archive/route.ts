// PUT /api/settings/archive — set the archive/bin retention period (gated).
import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/server/settings/settings.controller";
import { requireCapability } from "@/server/guard";

export async function PUT(req: NextRequest) {
  const gate = await requireCapability("manage_settings");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const result = settingsController.setArchiveRetention(body);
  return NextResponse.json(result.body, { status: result.status });
}
