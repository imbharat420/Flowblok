// Space service — the ACTIVE space's metadata + counts for the dashboard.
// Counts are derived from the database (stories/pages/workflows) for the space
// the user currently has selected (fb_space cookie). Activity stays seeded.

import { activity } from "@/server/db";
import type { ActivityEvent, Space } from "@/lib/types";
import { getActiveSpaceId } from "@/server/spaces/active-space";
import { spacesRepository } from "@/server/spaces/spaces.repository";
import { getDb } from "@/server/db/client";
import { stories, workflows } from "@/server/db/schema";
import { and, count, eq, inArray } from "drizzle-orm";

const PAGE_TYPES = ["page", "landing_page"];

const EMPTY_SPACE: Space = {
  id: "none",
  name: "No space yet",
  plan: "Starter",
  counts: { pages: 0, collections: 0, workflows: 0, apis: 0, users: 0, roles: 6, aiAgents: 0, deployments: 0 },
};

export class SpaceService {
  async get(): Promise<Space> {
    const spaceId = await getActiveSpaceId();
    if (!spaceId) return EMPTY_SPACE;
    const sp = await spacesRepository.findById(spaceId);
    const db = await getDb();
    const [pages] = await db
      .select({ c: count() })
      .from(stories)
      .where(and(eq(stories.spaceId, spaceId), inArray(stories.contentType, PAGE_TYPES)));
    const [all] = await db.select({ c: count() }).from(stories).where(eq(stories.spaceId, spaceId));
    const [wf] = await db.select({ c: count() }).from(workflows).where(eq(workflows.spaceId, spaceId));
    return {
      id: spaceId,
      name: sp?.name ?? "Space",
      plan: (sp?.plan as Space["plan"]) ?? "Professional",
      counts: {
        pages: Number(pages?.c ?? 0),
        collections: Math.max(0, Number(all?.c ?? 0) - Number(pages?.c ?? 0)),
        workflows: Number(wf?.c ?? 0),
        apis: 0,
        users: sp?.members ?? 1,
        roles: 6,
        aiAgents: 0,
        deployments: 0,
      },
    };
  }

  recentActivity(limit = 6): ActivityEvent[] {
    return [...activity].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
  }
}

export const spaceService = new SpaceService();
