// Module-local types for the Assets (media library) module.

export type AssetType = "image" | "video" | "document";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  sizeKB: number;
  /** e.g. "1920x1080"; null for documents and other non-visual assets */
  dimensions: string | null;
  folder: string;
  createdAt: string;
}

export interface AssetFolder {
  /** slug used for filtering; "all" is the catch-all rail item */
  id: string;
  name: string;
  count: number;
}

export interface AssetListResult {
  items: Asset[];
  total: number;
  meta: {
    folders: AssetFolder[];
    typeBreakdown: Record<AssetType, number>;
  };
}
