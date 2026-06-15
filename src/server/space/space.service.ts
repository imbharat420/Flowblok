// Space service — dashboard data (space metadata, counts, activity stream).
import { activity, space } from "@/server/db";
import type { ActivityEvent, Space } from "@/lib/types";

export class SpaceService {
  get(): Space {
    return space;
  }

  recentActivity(limit = 6): ActivityEvent[] {
    return [...activity]
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, limit);
  }
}

export const spaceService = new SpaceService();
