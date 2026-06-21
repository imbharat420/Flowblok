// Repository layer — the ONLY layer that owns the data source.
// Holds its own in-memory seed array; swap for Prisma/Supabase without
// touching the service or controller.

import type { MarketplaceItem } from "./marketplace.types";

// Cleared: the marketplace catalog starts empty.
const items: MarketplaceItem[] = [];

export class MarketplaceRepository {
  findAll(): MarketplaceItem[] {
    return items;
  }

  findById(id: string): MarketplaceItem | undefined {
    return items.find((i) => i.id === id);
  }
}

export const marketplaceRepository = new MarketplaceRepository();
