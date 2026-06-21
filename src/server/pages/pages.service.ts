// Service layer for the Pages module — search, status filter, derived stats.
// Knows nothing about HTTP. Pure and reusable from API routes or RSC.

import { PagesRepository, pagesRepository } from "./pages.repository";
import { toPageRow } from "./pages.types";
import type { PageRow, PagesListQuery, PagesListResult } from "./pages.types";

export class PagesService {
  constructor(private readonly repo: PagesRepository = pagesRepository) {}

  async list(spaceId: string, query: PagesListQuery = {}): Promise<PagesListResult> {
    let stories = await this.repo.findAllForSpace(spaceId);

    if (query.search) {
      const q = query.search.toLowerCase();
      stories = stories.filter(
        (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
      );
    }
    if (query.status) stories = stories.filter((s) => s.status === query.status);

    const breakdown = stories.reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {});

    const items: PageRow[] = stories
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map(toPageRow);

    return { items, total: items.length, meta: { statusBreakdown: breakdown } };
  }

  async getById(id: string): Promise<PageRow | null> {
    const story = await this.repo.findById(id);
    return story ? toPageRow(story) : null;
  }
}

export const pagesService = new PagesService();
