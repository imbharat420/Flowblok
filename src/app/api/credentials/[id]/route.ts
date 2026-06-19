// GET/PUT/DELETE /api/credentials/:id — read, update, or delete a credential.
// Read returns masked secrets; update accepts plaintext and returns masked.
import { NextResponse } from "next/server";
import { credentialsController } from "@/server/credentials/credentials.controller";
import { requireCapability } from "@/server/guard";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = credentialsController.getById(id);
  return NextResponse.json(r.body, { status: r.status });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_settings");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const r = credentialsController.update(id, body);
  return NextResponse.json(r.body, { status: r.status });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireCapability("manage_settings");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const { id } = await ctx.params;
  const r = credentialsController.remove(id);
  return NextResponse.json(r.body, { status: r.status });
}
