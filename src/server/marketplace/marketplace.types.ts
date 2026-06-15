// Module-local types for the Marketplace module.

export type MarketplaceItemType = "Template" | "Plugin" | "Workflow" | "Agent" | "Theme";

export interface MarketplaceItem {
  id: string;
  name: string;
  type: MarketplaceItemType;
  category: string;
  author: string;
  price: number; // 0 = Free
  installs: number;
  rating: number; // 0–5
}

export interface MarketplaceListQuery {
  type?: MarketplaceItemType;
}
