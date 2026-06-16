// HTTP adapter for GET/PUT /api/users/:id — delegates to the controller.
import { NextResponse } from "next/server";
import { usersController } from "@/server/users/users.controller";
import { requireCapability } from "@/server/guard";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const result = usersController.getById(id);
  return NextResponse.json(result.body, { status: result.status });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_users");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const result = usersController.update(id, body);
  return NextResponse.json(result.body, { status: result.status });
}
