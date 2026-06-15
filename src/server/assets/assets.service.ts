// Service layer — business logic: filtering by folder, derived folder counts
// and type breakdown. Knows nothing about HTTP. Pure, testable, reusable.

import { AssetsRepository, assetsRepository } from "./assets.repository";
import type { Asset, AssetFolder, AssetListResult, AssetType } from "./assets.types";

const FOLDER_LABELS: Record<string, string> = {
  marketing: "Marketing",
  product: "Product",
  brand: "Brand",
  blog: "Blog",
};

export interface AssetsListQuery {
  folder?: string;
}

export class AssetsService {
  constructor(private readonly repo: AssetsRepository = assetsRepository) {}

  list(query: AssetsListQuery = {}): AssetListResult {
    const all = this.repo.findAll();

    let items = all;
    if (query.folder && query.folder !== "all") {
      items = items.filter((a) => a.folder === query.folder);
    }

    items = [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      items,
      total: items.length,
      meta: {
        folders: this.folders(all),
        typeBreakdown: this.typeBreakdown(all),
      },
    };
  }

  getById(id: string): Asset | null {
    return this.repo.findById(id) ?? null;
  }

  /** "All" rail item + one entry per distinct folder, with counts */
  private folders(all: Asset[]): AssetFolder[] {
    const counts = all.reduce<Record<string, number>>((acc, a) => {
      acc[a.folder] = (acc[a.folder] ?? 0) + 1;
      return acc;
    }, {});

    const folders: AssetFolder[] = [{ id: "all", name: "All assets", count: all.length }];
    Object.keys(counts)
      .sort((a, b) => (FOLDER_LABELS[a] ?? a).localeCompare(FOLDER_LABELS[b] ?? b))
      .forEach((id) => {
        folders.push({ id, name: FOLDER_LABELS[id] ?? id, count: counts[id] });
      });
    return folders;
  }

  private typeBreakdown(all: Asset[]): Record<AssetType, number> {
    const base: Record<AssetType, number> = { image: 0, video: 0, document: 0 };
    return all.reduce((acc, a) => {
      acc[a.type] += 1;
      return acc;
    }, base);
  }
}

export const assetsService = new AssetsService();
