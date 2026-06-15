import { NextResponse } from "next/server";
import { databaseController } from "@/server/database/database.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = databaseController.getById(id);
  return NextResponse.json(r.body, { status: r.status });
}
