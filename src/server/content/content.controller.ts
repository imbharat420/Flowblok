// Controller layer — maps HTTP concerns (query parsing, status codes, shapes)
// to service calls. Mirrors the NestJS @Controller pattern in 02-TECHNICAL-ARCHITECTURE.md.
// Next.js route handlers are thin adapters that delegate here.

import { ContentService, contentService } from "./content.service";
import type { ContentStatus, ListQuery } from "@/lib/types";

export interface ApiResult {
  status: number;
  body: unknown;
}

const STATUSES: ContentStatus[] = ["draft", "review", "published"];

export class ContentController {
  constructor(private readonly service: ContentService = contentService) {}

  // GET /api/content
  list(searchParams: URLSearchParams): ApiResult {
    const statusParam = searchParams.get("status");
    const query: ListQuery = {
      search: searchParams.get("search") ?? undefined,
      contentType: searchParams.get("contentType") ?? undefined,
      status: STATUSES.includes(statusParam as ContentStatus)
        ? (statusParam as ContentStatus)
        : undefined,
      page: numberParam(searchParams.get("page")),
      perPage: numberParam(searchParams.get("perPage")),
    };

    const result = this.service.list(query);
    return {
      status: 200,
      body: {
        ...result,
        meta: {
          statusBreakdown: this.service.statusBreakdown(),
          contentTypes: this.service.contentTypes(),
          folders: this.service.folders(),
        },
      },
    };
  }

  // GET /api/content/:id
  getById(id: string): ApiResult {
    const story = this.service.getById(id);
    if (!story) return { status: 404, body: { error: "Story not found", id } };
    return { status: 200, body: story };
  }

  // PUT /api/content/:id
  update(id: string, body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { name, status, content } = body as Record<string, unknown>;
    const patch: import("@/lib/types").UpdateStoryInput = {};
    if (typeof name === "string") patch.name = name;
    if (STATUSES.includes(status as ContentStatus)) patch.status = status as ContentStatus;
    if (content && typeof content === "object") patch.content = content as never;

    const updated = this.service.update(id, patch);
    if (!updated) return { status: 404, body: { error: "Story not found", id } };
    return { status: 200, body: updated };
  }

  // POST /api/content
  create(body: unknown): ApiResult {
    if (!body || typeof body !== "object") {
      return { status: 400, body: { error: "Invalid body" } };
    }
    const { name, contentType } = body as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim()) {
      return { status: 400, body: { error: "Name is required" } };
    }
    const story = this.service.create({
      name: name.trim(),
      contentType: typeof contentType === "string" ? contentType : undefined,
    });
    return { status: 201, body: story };
  }

  // DELETE /api/content/:id
  remove(id: string): ApiResult {
    const removed = this.service.remove(id);
    if (!removed) return { status: 404, body: { error: "Story not found", id } };
    return { status: 200, body: { ok: true, id } };
  }

  // GET /api/content/:id/versions
  versions(id: string): ApiResult {
    if (!this.service.getById(id)) return { status: 404, body: { error: "Story not found", id } };
    return { status: 200, body: { items: this.service.versions(id) } };
  }

  // POST /api/content/:id/restore
  restore(id: string, body: unknown): ApiResult {
    const versionId = (body as { versionId?: string })?.versionId;
    if (!versionId) return { status: 400, body: { error: "versionId is required" } };
    const restored = this.service.restore(id, versionId);
    if (!restored) return { status: 404, body: { error: "Story or version not found", id, versionId } };
    return { status: 200, body: restored };
  }
}

function numberParam(v: string | null): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export const contentController = new ContentController();
