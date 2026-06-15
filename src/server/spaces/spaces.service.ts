// Service layer — business logic: sorting, derived stats. Knows nothing about
// HTTP. Pure, testable, reusable from API routes, RSC, or workflows.

import { SpacesRepository, spacesRepository } from "./spaces.repository";
import type { Space, SpacesStats } from "./spaces.types";

export class SpacesService {
  constructor(private readonly repo: SpacesRepository = spacesRepository) {}

  list(): Space[] {
    return [...this.repo.findAll()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getById(id: string): Space | null {
    return this.repo.findById(id) ?? null;
  }

  /** Headline figures for the KPI row. */
  stats(): SpacesStats {
    const all = this.repo.findAll();
    return {
      total: all.length,
      active: all.filter((s) => s.status === "active").length,
      paused: all.filter((s) => s.status === "paused").length,
      totalMembers: all.reduce((sum, s) => sum + s.members, 0),
      plansInUse: new Set(all.map((s) => s.plan)).size,
    };
  }
}

export const spacesService = new SpacesService();
