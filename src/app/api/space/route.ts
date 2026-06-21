// HTTP adapter for GET /api/space — space metadata + recent activity for the dashboard.
import { NextResponse } from "next/server";
import { spaceService } from "@/server/space/space.service";

export async function GET() {
  return NextResponse.json({
    space: await spaceService.get(),
    activity: spaceService.recentActivity(),
  });
}
