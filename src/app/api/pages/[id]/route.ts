import { NextResponse } from "next/server";
import { pagesController } from "@/server/pages/pages.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = await pagesController.getById(id);
  return NextResponse.json(r.body, { status: r.status });
}
