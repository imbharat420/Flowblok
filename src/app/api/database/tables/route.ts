import { NextResponse } from "next/server";
import { databaseController } from "@/server/database/database.controller";

export function GET() {
  const r = databaseController.list();
  return NextResponse.json(r.body, { status: r.status });
}
