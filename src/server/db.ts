// In-memory data source for the first visualization.
// This stands in for the Postgres + RLS layer described in 02-TECHNICAL-ARCHITECTURE.md.
// Repositories read from here; swapping this for Prisma/Supabase later is a single-layer change.

import type { ActivityEvent, Folder, Space, Story } from "@/lib/types";

// Legacy in-memory arrays (content/spaces now live in Postgres). Kept as empty
// exports for any residual importer; the real data source is the database.
export const space: Space = {
  id: "none",
  name: "No space yet",
  plan: "Starter",
  counts: { pages: 0, collections: 0, workflows: 0, apis: 0, users: 0, roles: 0, aiAgents: 0, deployments: 0 },
};

export const folders: Folder[] = [];
export const stories: Story[] = [];
export const activity: ActivityEvent[] = [];
