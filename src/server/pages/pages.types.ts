// Module-local types for the Pages module.
// A "Page" is a Story whose contentType is page-like (page / landing_page).

import type { ContentStatus, Story } from "@/lib/types";

/** Content types treated as "pages" in this module. */
export const PAGE_CONTENT_TYPES = ["page", "landing_page"] as const;
export type PageContentType = (typeof PAGE_CONTENT_TYPES)[number];

/** A page row — a projection of Story for the listing surface. */
export interface PageRow {
  id: string;
  name: string;
  slug: string;
  contentType: string;
  status: ContentStatus;
  author: string;
  updatedAt: string;
}

export interface PagesListQuery {
  search?: string;
  status?: ContentStatus;
}

export interface PagesListResult {
  items: PageRow[];
  total: number;
  meta: {
    statusBreakdown: Record<string, number>;
  };
}

export function toPageRow(s: Story): PageRow {
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    contentType: s.contentType,
    status: s.status,
    author: s.author,
    updatedAt: s.updatedAt,
  };
}

export function isPageType(contentType: string): boolean {
  return (PAGE_CONTENT_TYPES as readonly string[]).includes(contentType);
}
