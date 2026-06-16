// PUT /api/account/profile — update name/email/username/role/etc.
import { NextResponse } from "next/server";
import { accountController } from "@/server/account/account.controller";

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const r = accountController.updateProfile(body);
  return NextResponse.json(r.body, { status: r.status });
}
