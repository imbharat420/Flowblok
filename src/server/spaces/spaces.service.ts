// Service layer — business logic: sorting, derived stats. Knows nothing about
// HTTP. Pure, testable, reusable from API routes, RSC, or workflows.

import { SpacesRepository, spacesRepository } from "./spaces.repository";
import type { CreateSpaceInput, Space, SpacesStats } from "./spaces.types";

const isArchived = (s: Space) => !!s.archivedAt;

export class SpacesService {
  constructor(private readonly repo: SpacesRepository = spacesRepository) {}

  /** Live (non-archived) spaces, newest first. */
  list(): Space[] {
    return this.repo.findAll().filter((s) => !isArchived(s)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /** Archived spaces awaiting purge, soonest-to-purge first. */
  listArchived(): Space[] {
    return this.repo
      .findAll()
      .filter(isArchived)
      .sort((a, b) => (a.purgeAt ?? "").localeCompare(b.purgeAt ?? ""));
  }

  getById(id: string): Space | null {
    return this.repo.findById(id) ?? null;
  }

  create(input: CreateSpaceInput): Space {
    return this.repo.create(input);
  }

  archive(id: string): Space | null {
    return this.repo.archive(id) ?? null;
  }

  restore(id: string): Space | null {
    return this.repo.restore(id) ?? null;
  }

  /** Headline figures for the KPI row (live spaces only). */
  stats(): SpacesStats {
    const all = this.list();
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
