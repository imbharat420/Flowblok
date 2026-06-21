// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed array; swap for Prisma/S3 metadata later
// without touching the service or controller.

import type { Asset } from "./assets.types";

// Cleared: the asset library starts empty.
const assets: Asset[] = [];

export class AssetsRepository {
  findAll(): Asset[] {
    return assets;
  }

  findById(id: string): Asset | undefined {
    return assets.find((a) => a.id === id);
  }
}

export const assetsRepository = new AssetsRepository();
