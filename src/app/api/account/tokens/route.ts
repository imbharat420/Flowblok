// POST /api/account/tokens — generate a personal access token (returns plain value once).
import { NextResponse } from "next/server";
import { accountController } from "@/server/account/account.controller";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const r = accountController.createToken(body);
  return NextResponse.json(r.body, { status: r.status });
}
