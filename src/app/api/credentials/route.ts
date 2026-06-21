// GET /api/credentials — list credentials (secrets masked).
// POST /api/credentials — create a credential (accepts plaintext, returns masked).
import { NextResponse } from "next/server";
import { credentialsController } from "@/server/credentials/credentials.controller";
import { requireCapability } from "@/server/guard";

export async function GET() {
  const r = await credentialsController.list();
  return NextResponse.json(r.body, { status: r.status });
}

export async function POST(req: Request) {
  const gate = await requireCapability("manage_settings");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
  const body = await req.json().catch(() => null);
  const r = await credentialsController.create(body);
  return NextResponse.json(r.body, { status: r.status });
}
