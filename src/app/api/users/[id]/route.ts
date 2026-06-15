// HTTP adapter for GET /api/users/:id — delegates to the controller.
import { NextResponse } from "next/server";
import { usersController } from "@/server/users/users.controller";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = usersController.getById(id);
  return NextResponse.json(result.body, { status: result.status });
}
