// Service layer — business logic: filtering, search, pagination, derived stats.
// Knows nothing about HTTP. Pure, testable, reusable from API routes, RSC, or workflows.

import { ContentRepository, contentRepository } from "./content.repository";
import type { Folder, ListQuery, Paginated, Story } from "@/lib/types";

export class ContentService {
  constructor(private readonly repo: ContentRepository = contentRepository) {}

  list(query: ListQuery = {}): Paginated<Story> {
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.min(100, Math.max(1, query.perPage ?? 25));

    let items = this.repo.findAll();

    if (query.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (s) => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q),
      );
    }
    if (query.status) items = items.filter((s) => s.status === query.status);
    if (query.contentType) items = items.filter((s) => s.contentType === query.contentType);

    items = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

    const total = items.length;
    const start = (page - 1) * perPage;
    return { items: items.slice(start, start + perPage), total, page, perPage };
  }

  getById(id: string): Story | null {
    return this.repo.findById(id) ?? null;
  }

  update(id: string, input: import("@/lib/types").UpdateStoryInput): Story | null {
    return this.repo.update(id, input) ?? null;
  }

  create(input: { name: string; contentType?: string }): Story {
    return this.repo.create(input);
  }

  remove(id: string): Story | null {
    return this.repo.remove(id) ?? null;
  }

  versions(id: string): import("@/lib/types").StoryVersion[] {
    return this.repo.listVersions(id);
  }

  restore(id: string, versionId: string): Story | null {
    return this.repo.restore(id, versionId) ?? null;
  }

  folders(): Folder[] {
    return this.repo.listFolders();
  }

  /** counts by status — feeds the dashboard pipeline widget */
  statusBreakdown(): Record<string, number> {
    return this.repo.findAll().reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] ?? 0) + 1;
      return acc;
    }, {});
  }

  contentTypes(): string[] {
    return [...new Set(this.repo.findAll().map((s) => s.contentType))].sort();
  }
}

export const contentService = new ContentService();
