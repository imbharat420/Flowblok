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
}

export interface SpacesStats {
  total: number;
  active: number;
  paused: number;
  totalMembers: number;
  plansInUse: number;
}
