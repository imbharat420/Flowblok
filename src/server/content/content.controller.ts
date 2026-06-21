// Content controller — resolves the active space, parses HTTP, delegates to the
// service. Next.js route handlers are thin adapters that delegate here.

import { ContentService, contentService } from "./content.service";
import { getActiveSpaceId } from "@/server/spaces/active-space";
import type { ContentStatus, ListQuery, UpdateStoryInput } from "@/lib/types";

export interface ApiResult {
  status: number;
  body: unknown;
}

const STATUSES: ContentStatus[] = ["draft", "review", "published"];

export class ContentController {
  constructor(private readonly service: ContentService = contentService) {}

  // GET /api/content
  async list(searchParams: URLSearchParams): Promise<ApiResult> {
    const spaceId = (await getActiveSpaceId()) ?? "";
    const statusParam = searchParams.get("status");
    const query: ListQuery = {
      search: searchParams.get("search") ?? undefined,
      contentType: searchParams.get("contentType") ?? undefined,
      status: STATUSES.includes(statusParam as ContentStatus) ? (statusParam as ContentStatus) : undefined,
      page: numberParam(searchParams.get("page")),
      perPage: numberParam(searchParams.get("perPage")),
    };
    const result = await this.service.list(spaceId, query);
    const [statusBreakdown, contentTypes, folders] = await Promise.all([
      this.service.statusBreakdown(spaceId),
      this.service.contentTypes(spaceId),
      this.service.folders(spaceId),
    ]);
    return { status: 200, body: { ...result, meta: { statusBreakdown, contentTypes, folders } } };
  }

  // GET /api/content/:id
  async getById(id: string): Promise<ApiResult> {
    const story = await this.service.getById(id);
    if (!story) return { status: 404, body: { error: "Story not found", id } };
    return { status: 200, body: story };
  }

  // PUT /api/content/:id
  async update(id: string, body: unknown): Promise<ApiResult> {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const { name, status, content } = body as Record<string, unknown>;
    const patch: UpdateStoryInput = {};
    if (typeof name === "string") patch.name = name;
    if (STATUSES.includes(status as ContentStatus)) patch.status = status as ContentStatus;
    if (content && typeof content === "object") patch.content = content as never;
    const updated = await this.service.update(id, patch);
    if (!updated) return { status: 404, body: { error: "Story not found", id } };
    return { status: 200, body: updated };
  }

  // POST /api/content
  async create(body: unknown): Promise<ApiResult> {
    if (!body || typeof body !== "object") return { status: 400, body: { error: "Invalid body" } };
    const spaceId = await getActiveSpaceId();
    if (!spaceId) return { status: 400, body: { error: "No active space — create or select a space first." } };
    const { name, contentType } = body as Record<string, unknown>;
    if (typeof name !== "string" || !name.trim()) return { status: 400, body: { error: "Name is required" } };
    const story = await this.service.create(spaceId, {
      name: name.trim(),
      contentType: typeof contentType === "string" ? contentType : undefined,
    });
    return { status: 201, body: story };
  }

  // DELETE /api/content/:id
  async remove(id: string): Promise<ApiResult> {
    const removed = await this.service.remove(id);
    if (!removed) return { status: 404, body: { error: "Story not found", id } };
    return { status: 200, body: { ok: true, id } };
  }

  // GET /api/content/:id/versions
  async versions(id: string): Promise<ApiResult> {
    if (!(await this.service.getById(id))) return { status: 404, body: { error: "Story not found", id } };
    return { status: 200, body: { items: await this.service.versions(id) } };
  }

  // POST /api/content/:id/restore
  async restore(id: string, body: unknown): Promise<ApiResult> {
    const versionId = (body as { versionId?: string })?.versionId;
    if (!versionId) return { status: 400, body: { error: "versionId is required" } };
    const restored = await this.service.restore(id, versionId);
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
