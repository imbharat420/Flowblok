// HTTP adapter for GET/PUT/DELETE /api/content/:id — delegates to the controller.
import { NextResponse } from "next/server";
import { contentController } from "@/server/content/content.controller";
import { requireCapability } from "@/server/guard";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = await contentController.getById(id);
  return NextResponse.json(result.body, { status: result.status });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("edit_content");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const result = await contentController.update(id, body);
  return NextResponse.json(result.body, { status: result.status });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("edit_content");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const result = await contentController.remove(id);
  return NextResponse.json(result.body, { status: result.status });
}
