// Controller layer — maps HTTP concerns (query parsing, status codes, shapes)
// to service calls. Route handlers are thin adapters that delegate here.

import { MarketplaceService, marketplaceService } from "./marketplace.service";
import type { ApiResult } from "@/server/content/content.controller";
import type { MarketplaceItemType } from "./marketplace.types";

const TYPES: MarketplaceItemType[] = ["Template", "Plugin", "Workflow", "Agent", "Theme"];

export class MarketplaceController {
  constructor(private readonly service: MarketplaceService = marketplaceService) {}

  // GET /api/marketplace
  list(searchParams: URLSearchParams): ApiResult {
    const typeParam = searchParams.get("type");
    const type = TYPES.includes(typeParam as MarketplaceItemType)
      ? (typeParam as MarketplaceItemType)
      : undefined;

    const items = this.service.list({ type });
    return {
      status: 200,
      body: {
        items,
        total: items.length,
        meta: {
          types: this.service.types(),
          countsByType: this.service.countsByType(),
          platformFee: this.service.platformFee,
        },
      },
    };
  }

  // GET /api/marketplace/:id
  getById(id: string): ApiResult {
    const item = this.service.getById(id);
    if (!item) return { status: 404, body: { error: "Item not found", id } };
    return { status: 200, body: item };
  }
}

export const marketplaceController = new MarketplaceController();
