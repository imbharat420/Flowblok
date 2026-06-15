// Service layer — business logic: filtering and derived stats.
// Knows nothing about HTTP. Pure, testable, reusable from routes or RSC.

import { MarketplaceRepository, marketplaceRepository } from "./marketplace.repository";
import type { MarketplaceItem, MarketplaceItemType, MarketplaceListQuery } from "./marketplace.types";

const PLATFORM_FEE = 0.2; // 20% platform fee — creators keep 80%

export class MarketplaceService {
  constructor(private readonly repo: MarketplaceRepository = marketplaceRepository) {}

  list(query: MarketplaceListQuery = {}): MarketplaceItem[] {
    let items = this.repo.findAll();
    if (query.type) items = items.filter((i) => i.type === query.type);
    // Most-installed first — the marketplace's default sort.
    return [...items].sort((a, b) => b.installs - a.installs);
  }

  getById(id: string): MarketplaceItem | null {
    return this.repo.findById(id) ?? null;
  }

  /** Distinct types present in the catalog — feeds the filter chips. */
  types(): MarketplaceItemType[] {
    const order: MarketplaceItemType[] = ["Template", "Plugin", "Workflow", "Agent", "Theme"];
    const present = new Set(this.repo.findAll().map((i) => i.type));
    return order.filter((t) => present.has(t));
  }

  /** Counts per type — drives chip count badges. */
  countsByType(): Record<string, number> {
    return this.repo.findAll().reduce<Record<string, number>>((acc, i) => {
      acc[i.type] = (acc[i.type] ?? 0) + 1;
      return acc;
    }, {});
  }

  get platformFee(): number {
    return PLATFORM_FEE;
  }
}

export const marketplaceService = new MarketplaceService();
