import { NextResponse } from "next/server";
import { analyticsController } from "@/server/analytics/analytics.controller";

// GET /api/analytics?role=ceo|cto|manager|dev
export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const r = analyticsController.dashboard(searchParams);
  return NextResponse.json(r.body, { status: r.status });
}
