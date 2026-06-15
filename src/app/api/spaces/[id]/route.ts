// HTTP adapter for GET /api/spaces/:id — delegates to the controller.
import { NextResponse } from "next/server";
import { spacesController } from "@/server/spaces/spaces.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = spacesController.getById(id);
  return NextResponse.json(result.body, { status: result.status });
}
