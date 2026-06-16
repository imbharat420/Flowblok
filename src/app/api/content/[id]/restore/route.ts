// POST /api/content/:id/restore — restore a prior version (gated).
import { NextResponse } from "next/server";
import { contentController } from "@/server/content/content.controller";
import { requireCapability } from "@/server/guard";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("edit_content");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const r = contentController.restore(id, body);
  return NextResponse.json(r.body, { status: r.status });
}
