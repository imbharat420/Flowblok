// HTTP adapter for GET /api/content/:id — delegates to the controller.
import { NextResponse } from "next/server";
import { contentController } from "@/server/content/content.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = contentController.getById(id);
  return NextResponse.json(result.body, { status: result.status });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const result = contentController.update(id, body);
  return NextResponse.json(result.body, { status: result.status });
}
