// GET /api/spaces/archived — spaces in the 30-day archive awaiting purge.
import { NextResponse } from "next/server";
import { spacesController } from "@/server/spaces/spaces.controller";

export function GET() {
  const r = spacesController.archived();
  return NextResponse.json(r.body, { status: r.status });
}
