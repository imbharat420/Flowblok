// DELETE /api/account/tokens/:id — revoke a personal access token.
import { NextResponse } from "next/server";
import { accountController } from "@/server/account/account.controller";

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const r = accountController.deleteToken(id);
  return NextResponse.json(r.body, { status: r.status });
}
