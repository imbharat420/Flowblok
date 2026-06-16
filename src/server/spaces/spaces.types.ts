// Module-local types for the Spaces (super-admin) surface.

export type SpacePlan = "Starter" | "Professional" | "Business" | "Enterprise";
export type SpaceStatus = "active" | "paused";

export interface Space {
  id: string;
  name: string;
  plan: SpacePlan;
  status: SpaceStatus;
  members: number;
  region: string;
  createdAt: string; // ISO date
  archivedAt?: string | null; // set when soft-deleted; null/absent when live
  purgeAt?: string | null; // archivedAt + 30 days — permanent deletion deadline
}

export interface SpacesStats {
  total: number;
  active: number;
  paused: number;
  totalMembers: number;
  plansInUse: number;
}

export interface CreateSpaceInput {
  name: string;
  plan?: SpacePlan;
  region?: string;
}
