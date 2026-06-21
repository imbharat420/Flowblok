// Spaces controller — resolves the current owner from the session and maps HTTP
// concerns to the service. Spaces are always scoped to the signed-in account.

import { SpacesService, spacesService } from "./spaces.service";
import { getOwnerId } from "./active-space";
import { spacesRepository } from "./spaces.repository";
import type { ApiResult } from "@/server/content/content.controller";

export class SpacesController {
  constructor(private readonly service: SpacesService = spacesService) {}

  // GET /api/spaces
  async list(): Promise<ApiResult> {
    const ownerId = await getOwnerId();
    if (!ownerId) return { status: 200, body: { items: [], meta: { stats: this.service.statsFor([]) } } };
    const items = await this.service.list(ownerId);
    return { status: 200, body: { items, meta: { stats: this.service.statsFor(items) } } };
  }

  // GET /api/spaces/:id
  async getById(id: string): Promise<ApiResult> {
    const space = await this.service.getById(id);
    if (!space) return { status: 404, body: { error: "Space not found", id } };
    return { status: 200, body: space };
  }

  // GET /api/spaces/archived
  async archived(): Promise<ApiResult> {
    const ownerId = await getOwnerId();
    if (!ownerId) return { status: 200, body: { items: [] } };
    return { status: 200, body: { items: await this.service.listArchived(ownerId) } };
  }

  // POST /api/spaces
  async create(body: unknown): Promise<ApiResult> {
    const ownerId = await getOwnerId();
    if (!ownerId) return { status: 401, body: { error: "Not signed in" } };
    const name = (body as { name?: string })?.name?.trim();
    if (!name) return { status: 400, body: { error: "Name is required" } };
    const plan = (body as { plan?: string }).plan as never;
    const region = (body as { region?: string }).region;
    return { status: 201, body: await this.service.create(ownerId, { name, plan, region }) };
  }

  // POST /api/spaces/:id/archive — only the owner may archive their space.
  async archive(id: string): Promise<ApiResult> {
    const ownerId = await getOwnerId();
    if (!ownerId || !(await spacesRepository.ownedBy(id, ownerId))) {
      return { status: 404, body: { error: "Space not found", id } };
    }
    const s = await this.service.archive(id);
    return s ? { status: 200, body: s } : { status: 404, body: { error: "Space not found", id } };
  }

  // POST /api/spaces/:id/restore
  async restore(id: string): Promise<ApiResult> {
    const ownerId = await getOwnerId();
    if (!ownerId || !(await spacesRepository.ownedBy(id, ownerId))) {
      return { status: 404, body: { error: "Space not found", id } };
    }
    const s = await this.service.restore(id);
    return s ? { status: 200, body: s } : { status: 404, body: { error: "Space not found", id } };
  }
}

export const spacesController = new SpacesController();
