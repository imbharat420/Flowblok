// Controller layer — maps HTTP concerns (query parsing, status codes, shapes)
// to service calls. Next.js route handlers are thin adapters that delegate here.

import { AssetsService, assetsService } from "./assets.service";
import type { ApiResult } from "@/server/content/content.controller";

export class AssetsController {
  constructor(private readonly service: AssetsService = assetsService) {}

  // GET /api/assets
  list(searchParams: URLSearchParams): ApiResult {
    const folder = searchParams.get("folder") ?? undefined;
    const result = this.service.list({ folder });
    return { status: 200, body: result };
  }

  // GET /api/assets/:id
  getById(id: string): ApiResult {
    const asset = this.service.getById(id);
    if (!asset) return { status: 404, body: { error: "Asset not found", id } };
    return { status: 200, body: asset };
  }
}

export const assetsController = new AssetsController();
