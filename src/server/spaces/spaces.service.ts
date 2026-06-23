// Spaces service — owner-scoped business logic (live/archived split, stats).

import { SpacesRepository, spacesRepository } from "./spaces.repository";
import type { CreateSpaceInput, Space, SpacesStats } from "./spaces.types";

const isArchived = (s: Space) => !!s.archivedAt;
const emptyStats: SpacesStats = { total: 0, active: 0, paused: 0, totalMembers: 0, plansInUse: 0 };

export class SpacesService {
  constructor(private readonly repo: SpacesRepository = spacesRepository) {}

  async list(ownerId: string): Promise<Space[]> {
    const all = await this.repo.findAllForOwner(ownerId);
    return all.filter((s) => !isArchived(s)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listArchived(ownerId: string): Promise<Space[]> {
    // Sweep anything past its retention deadline before listing the bin.
    await this.repo.purgeExpired(ownerId);
    const all = await this.repo.findAllForOwner(ownerId);
    return all.filter(isArchived).sort((a, b) => (a.purgeAt ?? "~").localeCompare(b.purgeAt ?? "~"));
  }

  // Permanently delete an archived space ("delete forever" from the bin).
  async deleteForever(id: string): Promise<boolean> {
    return this.repo.remove(id);
  }

  async getById(id: string): Promise<Space | null> {
    return (await this.repo.findById(id)) ?? null;
  }

  async create(ownerId: string, input: CreateSpaceInput): Promise<Space> {
    return this.repo.create(ownerId, input);
  }

  async archive(id: string): Promise<Space | null> {
    return (await this.repo.archive(id)) ?? null;
  }

  async restore(id: string): Promise<Space | null> {
    return (await this.repo.restore(id)) ?? null;
  }

  statsFor(live: Space[]): SpacesStats {
    if (!live.length) return emptyStats;
    return {
      total: live.length,
      active: live.filter((s) => s.status === "active").length,
      paused: live.filter((s) => s.status === "paused").length,
      totalMembers: live.reduce((sum, s) => sum + s.members, 0),
      plansInUse: new Set(live.map((s) => s.plan)).size,
    };
  }
}

export const spacesService = new SpacesService();
