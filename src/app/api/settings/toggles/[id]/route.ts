// HTTP adapter for PUT /api/settings/toggles/:id (Next 15 — params is a Promise).
import { NextRequest, NextResponse } from "next/server";
import { settingsController } from "@/server/settings/settings.controller";
import { requireCapability } from "@/server/guard";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_settings");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const result = settingsController.setToggle(id, body);
  return NextResponse.json(result.body, { status: result.status });
}
