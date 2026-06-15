// Repository layer — the ONLY layer that talks to the data source.
// Holds its own in-memory seed array; swap for Prisma/S3 metadata later
// without touching the service or controller.

import type { Asset } from "./assets.types";

const assets: Asset[] = [
  {
    id: "ast_01",
    name: "hero-homepage-spring.jpg",
    type: "image",
    sizeKB: 842,
    dimensions: "2400x1260",
    folder: "marketing",
    createdAt: "2026-05-28T09:12:00.000Z",
  },
  {
    id: "ast_02",
    name: "product-launch-teaser.mp4",
    type: "video",
    sizeKB: 28714,
    dimensions: "1920x1080",
    folder: "marketing",
    createdAt: "2026-05-30T14:40:00.000Z",
  },
  {
    id: "ast_03",
    name: "brand-guidelines-2026.pdf",
    type: "document",
    sizeKB: 4180,
    dimensions: null,
    folder: "brand",
    createdAt: "2026-04-11T11:05:00.000Z",
  },
  {
    id: "ast_04",
    name: "logo-mark-dark.svg",
    type: "image",
    sizeKB: 18,
    dimensions: "512x512",
    folder: "brand",
    createdAt: "2026-03-02T08:20:00.000Z",
  },
  {
    id: "ast_05",
    name: "team-offsite-lisbon.jpg",
    type: "image",
    sizeKB: 1536,
    dimensions: "3000x2000",
    folder: "blog",
    createdAt: "2026-06-01T16:55:00.000Z",
  },
  {
    id: "ast_06",
    name: "onboarding-walkthrough.mp4",
    type: "video",
    sizeKB: 51240,
    dimensions: "1280x720",
    folder: "product",
    createdAt: "2026-05-18T10:30:00.000Z",
  },
  {
    id: "ast_07",
    name: "pricing-comparison.png",
    type: "image",
    sizeKB: 226,
    dimensions: "1440x900",
    folder: "product",
    createdAt: "2026-05-22T13:12:00.000Z",
  },
  {
    id: "ast_08",
    name: "q2-investor-update.pdf",
    type: "document",
    sizeKB: 2890,
    dimensions: null,
    folder: "brand",
    createdAt: "2026-06-05T09:45:00.000Z",
  },
  {
    id: "ast_09",
    name: "social-square-promo.jpg",
    type: "image",
    sizeKB: 612,
    dimensions: "1080x1080",
    folder: "marketing",
    createdAt: "2026-06-08T18:02:00.000Z",
  },
  {
    id: "ast_10",
    name: "feature-grid-icons.svg",
    type: "image",
    sizeKB: 44,
    dimensions: "800x600",
    folder: "product",
    createdAt: "2026-04-26T07:50:00.000Z",
  },
  {
    id: "ast_11",
    name: "customer-story-acme.mp4",
    type: "video",
    sizeKB: 39620,
    dimensions: "1920x1080",
    folder: "blog",
    createdAt: "2026-05-14T12:18:00.000Z",
  },
  {
    id: "ast_12",
    name: "press-kit-bundle.pdf",
    type: "document",
    sizeKB: 7340,
    dimensions: null,
    folder: "brand",
    createdAt: "2026-03-19T15:33:00.000Z",
  },
  {
    id: "ast_13",
    name: "blog-cover-design-systems.jpg",
    type: "image",
    sizeKB: 1184,
    dimensions: "1600x900",
    folder: "blog",
    createdAt: "2026-06-10T11:11:00.000Z",
  },
  {
    id: "ast_14",
    name: "app-screenshot-dashboard.png",
    type: "image",
    sizeKB: 388,
    dimensions: "2880x1800",
    folder: "product",
    createdAt: "2026-06-12T08:40:00.000Z",
  },
  {
    id: "ast_15",
    name: "webinar-replay-may.mp4",
    type: "video",
    sizeKB: 64210,
    dimensions: "1280x720",
    folder: "marketing",
    createdAt: "2026-05-26T17:25:00.000Z",
  },
  {
    id: "ast_16",
    name: "annual-report-2025.pdf",
    type: "document",
    sizeKB: 9120,
    dimensions: null,
    folder: "brand",
    createdAt: "2026-02-08T10:00:00.000Z",
  },
];

export class AssetsRepository {
  findAll(): Asset[] {
    return assets;
  }

  findById(id: string): Asset | undefined {
    return assets.find((a) => a.id === id);
  }
}

export const assetsRepository = new AssetsRepository();
