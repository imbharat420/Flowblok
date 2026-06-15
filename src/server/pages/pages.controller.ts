// Controller layer for the Pages module — maps HTTP concerns to service calls.
// Thin adapter; Next.js route handlers delegate here. Reuses the shared ApiResult.

import { PagesService, pagesService } from "./pages.service";
import type { ApiResult } from "@/server/content/content.controller";
import type { ContentStatus } from "@/lib/types";
import type { PagesListQuery } from "./pages.types";

const STATUSES: ContentStatus[] = ["draft", "review", "published"];

export class PagesController {
  constructor(private readonly service: PagesService = pagesService) {}

  // GET /api/pages
  list(searchParams: URLSearchParams): ApiResult {
    const statusParam = searchParams.get("status");
    const query: PagesListQuery = {
      search: searchParams.get("search") ?? undefined,
      status: STATUSES.includes(statusParam as ContentStatus)
        ? (statusParam as ContentStatus)
        : undefined,
    };
    return { status: 200, body: this.service.list(query) };
  }

  // GET /api/pages/:id
  getById(id: string): ApiResult {
    const page = this.service.getById(id);
    if (!page) return { status: 404, body: { error: "Page not found", id } };
    return { status: 200, body: page };
  }
}

export const pagesController = new PagesController();
