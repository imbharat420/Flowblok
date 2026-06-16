// GET /api/account — the signed-in user's full settings snapshot.
import { NextResponse } from "next/server";
import { accountController } from "@/server/account/account.controller";

export function GET() {
  const r = accountController.get();
  return NextResponse.json(r.body, { status: r.status });
}
