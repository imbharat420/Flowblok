// Service layer for the Pages module — search, status filter, derived stats.
// Knows nothing about HTTP. Pure and reusable from API routes or RSC.

import { PagesRepository, pagesRepository } from "./pages.repository";
import { toPageRow } from "./pages.types";
import type { PageRow, PagesListQuery, PagesListResult } from "./pages.types";

export class PagesService {
  constructor(private readonly repo: PagesRepository = pagesRepository) {}

  list(query: PagesListQuery = {}): PagesListResult {
    let stories = this.repo.findAll();

    if (query.search) {
      const q = query.search.toLowerCase();
      stories = stories.filter(
        (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
      );
    }
    if (query.status) stories = stories.filter((s) => s.status === query.status);

    const items: PageRow[] = stories
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(toPageRow);

    return { items, total: items.length, meta: { statusBreakdown: this.statusBreakdown() } };
  }

  getById(id: string): PageRow | null {
    const story = this.repo.findById(id);
    return story ? toPageRow(story) : null;
  }

  /** counts by status across all pages */
  statusBreakdown(): Record<string, number> {
    return this.repo.findAll().reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {});
  }
}

export const pagesService = new PagesService();
