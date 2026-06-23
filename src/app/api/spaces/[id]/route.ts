// HTTP adapter for GET/DELETE /api/spaces/:id — delegates to the controller.
import { NextResponse } from "next/server";
import { spacesController } from "@/server/spaces/spaces.controller";
import { requireCapability } from "@/server/guard";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await spacesController.getById(id);
  return NextResponse.json(result.body, { status: result.status });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_spaces");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const result = await spacesController.deleteForever(id);
  return NextResponse.json(result.body, { status: result.status });
}
