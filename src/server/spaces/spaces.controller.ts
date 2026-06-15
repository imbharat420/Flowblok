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
}

export const spacesController = new SpacesController();
