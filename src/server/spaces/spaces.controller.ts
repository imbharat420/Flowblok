// Controller layer — maps HTTP concerns (status codes, shapes) to service calls.
// Next.js route handlers are thin adapters that delegate here.

import { SpacesService, spacesService } from "./spaces.service";
import type { ApiResult } from "@/server/content/content.controller";

export class SpacesController {
  constructor(private readonly service: SpacesService = spacesService) {}

  // GET /api/spaces
  list(): ApiResult {
    return {
      status: 200,
      body: {
        items: this.service.list(),
        meta: { stats: this.service.stats() },
      },
    };
  }

  // GET /api/spaces/:id
  getById(id: string): ApiResult {
    const space = this.service.getById(id);
    if (!space) return { status: 404, body: { error: "Space not found", id } };
    return { status: 200, body: space };
  }

  // GET /api/spaces/archived
  archived(): ApiResult {
    return { status: 200, body: { items: this.service.listArchived() } };
  }

  // POST /api/spaces
  create(body: unknown): ApiResult {
    const name = (body as { name?: string })?.name?.trim();
    if (!name) return { status: 400, body: { error: "Name is required" } };
    const plan = (body as { plan?: string }).plan as never;
    const region = (body as { region?: string }).region;
    return { status: 201, body: this.service.create({ name, plan, region }) };
  }

  // POST /api/spaces/:id/archive
  archive(id: string): ApiResult {
    const s = this.service.archive(id);
    if (!s) return { status: 404, body: { error: "Space not found", id } };
    return { status: 200, body: s };
  }

  // POST /api/spaces/:id/restore
  restore(id: string): ApiResult {
    const s = this.service.restore(id);
    if (!s) return { status: 404, body: { error: "Space not found", id } };
    return { status: 200, body: s };
  }
}

export const spacesController = new SpacesController();
