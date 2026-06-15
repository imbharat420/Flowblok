import { NextResponse } from "next/server";
import { apisController } from "@/server/apis/apis.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = apisController.getById(id);
  return NextResponse.json(r.body, { status: r.status });
}
