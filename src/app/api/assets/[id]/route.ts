// HTTP adapter for GET /api/assets/:id — Next 15 params is a Promise.
import { NextResponse } from "next/server";
import { assetsController } from "@/server/assets/assets.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = assetsController.getById(id);
  return NextResponse.json(result.body, { status: result.status });
}
