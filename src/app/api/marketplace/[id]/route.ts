// HTTP adapter for GET /api/marketplace/:id — Next 15 params is a Promise.
import { NextResponse } from "next/server";
import { marketplaceController } from "@/server/marketplace/marketplace.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = marketplaceController.getById(id);
  return NextResponse.json(result.body, { status: result.status });
}
