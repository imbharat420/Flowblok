// Repository layer — the ONLY layer that owns the data source.
// Holds its own in-memory seed array; swap for Prisma/Supabase without
// touching the service or controller.

import type { MarketplaceItem } from "./marketplace.types";

const items: MarketplaceItem[] = [
  {
    id: "mk_01",
    name: "SaaS Landing Kit",
    type: "Template",
    category: "Marketing",
    author: "Acme Studio",
    price: 0,
    installs: 18420,
    rating: 4.8,
  },
  {
    id: "mk_02",
    name: "Stripe Billing Sync",
    type: "Plugin",
    category: "Payments",
    author: "Northwind Labs",
    price: 49,
    installs: 9234,
    rating: 4.6,
  },
  {
    id: "mk_03",
    name: "Lead Enrichment Agent",
    type: "Agent",
    category: "Sales",
    author: "Vela AI",
    price: 79,
    installs: 3110,
    rating: 4.4,
  },
  {
    id: "mk_04",
    name: "Onboarding Drip Workflow",
    type: "Workflow",
    category: "Lifecycle",
    author: "Acme Studio",
    price: 0,
    installs: 12780,
    rating: 4.7,
  },
  {
    id: "mk_05",
    name: "Midnight Pro Theme",
    type: "Theme",
    category: "Design",
    author: "Lumen Design",
    price: 29,
    installs: 6502,
    rating: 4.9,
  },
  {
    id: "mk_06",
    name: "Docs Starter",
    type: "Template",
    category: "Documentation",
    author: "Quill Collective",
    price: 0,
    installs: 21340,
    rating: 4.5,
  },
  {
    id: "mk_07",
    name: "Slack Notifier",
    type: "Plugin",
    category: "Notifications",
    author: "Northwind Labs",
    price: 0,
    installs: 15890,
    rating: 4.3,
  },
  {
    id: "mk_08",
    name: "Support Triage Agent",
    type: "Agent",
    category: "Support",
    author: "Vela AI",
    price: 99,
    installs: 2045,
    rating: 4.6,
  },
  {
    id: "mk_09",
    name: "Abandoned Cart Recovery",
    type: "Workflow",
    category: "E-commerce",
    author: "Cartwheel",
    price: 39,
    installs: 7421,
    rating: 4.2,
  },
  {
    id: "mk_10",
    name: "Aurora Glass Theme",
    type: "Theme",
    category: "Design",
    author: "Lumen Design",
    price: 0,
    installs: 9870,
    rating: 4.7,
  },
  {
    id: "mk_11",
    name: "Blog Engine Pro",
    type: "Template",
    category: "Content",
    author: "Quill Collective",
    price: 19,
    installs: 5430,
    rating: 4.4,
  },
  {
    id: "mk_12",
    name: "SEO Audit Agent",
    type: "Agent",
    category: "Marketing",
    author: "Vela AI",
    price: 59,
    installs: 4188,
    rating: 4.5,
  },
  {
    id: "mk_13",
    name: "Webhook Relay",
    type: "Plugin",
    category: "Integrations",
    author: "Conduit",
    price: 0,
    installs: 13260,
    rating: 4.1,
  },
  {
    id: "mk_14",
    name: "Weekly Digest Workflow",
    type: "Workflow",
    category: "Lifecycle",
    author: "Acme Studio",
    price: 0,
    installs: 8902,
    rating: 4.6,
  },
];

export class MarketplaceRepository {
  findAll(): MarketplaceItem[] {
    return items;
  }

  findById(id: string): MarketplaceItem | undefined {
    return items.find((i) => i.id === id);
  }
}

export const marketplaceRepository = new MarketplaceRepository();
