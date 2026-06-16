// HTTP adapter for GET/POST /api/users — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { usersController } from "@/server/users/users.controller";
import { requireCapability } from "@/server/guard";

export function GET(req: NextRequest) {
  const result = usersController.list(req.nextUrl.searchParams);
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: Request) {
  const gate = await requireCapability("manage_users");
  if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });

  const body = await req.json().catch(() => null);
  const result = usersController.create(body);
  return NextResponse.json(result.body, { status: result.status });
}
