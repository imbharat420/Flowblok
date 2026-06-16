// GET /api/content/:id/versions — version history for a story.
import { NextResponse } from "next/server";
import { contentController } from "@/server/content/content.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = contentController.versions(id);
  return NextResponse.json(r.body, { status: r.status });
}
