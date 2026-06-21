// Content service — space-scoped business logic (filter, search, paginate,
// derived stats). HTTP-agnostic.

import { ContentRepository, contentRepository } from "./content.repository";
import type { Folder, ListQuery, Paginated, Story, StoryVersion, UpdateStoryInput } from "@/lib/types";

export class ContentService {
  constructor(private readonly repo: ContentRepository = contentRepository) {}

  async list(spaceId: string, query: ListQuery = {}): Promise<Paginated<Story>> {
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.min(100, Math.max(1, query.perPage ?? 25));

    let items = spaceId ? await this.repo.findAllForSpace(spaceId) : [];
    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter((s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q));
    }
    if (query.status) items = items.filter((s) => s.status === query.status);
    if (query.contentType) items = items.filter((s) => s.contentType === query.contentType);

    const total = items.length;
    const start = (page - 1) * perPage;
    return { items: items.slice(start, start + perPage), total, page, perPage };
  }

  async getById(id: string): Promise<Story | null> {
    return (await this.repo.findById(id)) ?? null;
  }

  async update(id: string, input: UpdateStoryInput): Promise<Story | null> {
    return (await this.repo.update(id, input)) ?? null;
  }

  async create(spaceId: string, input: { name: string; contentType?: string }): Promise<Story> {
    return this.repo.create(spaceId, input);
  }

  async remove(id: string): Promise<Story | null> {
    return (await this.repo.remove(id)) ?? null;
  }

  async versions(id: string): Promise<StoryVersion[]> {
    return this.repo.listVersions(id);
  }

  async restore(id: string, versionId: string): Promise<Story | null> {
    return (await this.repo.restore(id, versionId)) ?? null;
  }

  async folders(spaceId: string): Promise<Folder[]> {
    return spaceId ? this.repo.listFoldersForSpace(spaceId) : [];
  }

  /** counts by status for a space — feeds the dashboard pipeline widget */
  async statusBreakdown(spaceId: string): Promise<Record<string, number>> {
    const all = spaceId ? await this.repo.findAllForSpace(spaceId) : [];
    return all.reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {});
  }

  async contentTypes(spaceId: string): Promise<string[]> {
    const all = spaceId ? await this.repo.findAllForSpace(spaceId) : [];
    return [...new Set(all.map((s) => s.contentType))].sort();
  }
}

export const contentService = new ContentService();
