// HTTP adapter for GET /api/users — delegates to the controller.
import { NextRequest, NextResponse } from "next/server";
import { usersController } from "@/server/users/users.controller";

export function GET(req: NextRequest) {
  const result = usersController.list(req.nextUrl.searchParams);
  return NextResponse.json(result.body, { status: result.status });
}
