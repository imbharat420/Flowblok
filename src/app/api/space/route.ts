// HTTP adapter for GET /api/space — space metadata + recent activity for the dashboard.
import { NextResponse } from "next/server";
import { spaceService } from "@/server/space/space.service";

export function GET() {
  return NextResponse.json({
    space: spaceService.get(),
    activity: spaceService.recentActivity(),
  });
}
